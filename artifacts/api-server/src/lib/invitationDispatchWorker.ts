import {
  db,
  companiesTable,
  employeeInvitationsTable,
  bulkInvitationBatchesTable,
  invitationEmailQueueTable,
} from "@workspace/db";
import { eq, and, sql, inArray } from "drizzle-orm";
import { dispatchNotificationDelivery } from "./notificationDeliveryService";
import { decryptToken } from "./tokenEncryption";
import { logger } from "./logger";

export interface DispatchWorkerOptions {
  batchSize?: number;
  originBaseUrl?: string;
}

export interface DispatchRunResult {
  processed: number;
  succeeded: number;
  failed: number;
  transientRetries: number;
  recoveredStale?: number;
}

interface ClaimedQueueItem {
  id: number;
  batchId: number | null;
  companyId: number;
  invitationId: number;
  recipientEmail: string;
  recipientName: string;
  encryptedRawToken: string | null;
  retryCount: number;
  maxRetries: number;
}

/**
 * Recovers jobs stuck in 'sending' state due to an unexpected worker termination.
 * Reclaims any job where claimed_at is older than 10 minutes.
 */
export async function recoverStaleSendingJobs(): Promise<number> {
  const staleThresholdMinutes = 10;
  const result: any = await db.execute(sql`
    UPDATE invitation_email_queue
    SET 
      status = 'queued',
      claimed_at = NULL,
      retry_count = retry_count + 1,
      next_attempt_at = NOW(),
      failure_reason = 'Previous dispatch attempt timed out; automatically requeued.',
      updated_at = NOW()
    WHERE 
      status = 'sending' 
      AND claimed_at < (NOW() - INTERVAL '10 minutes')
    RETURNING id
  `);

  const recoveredCount = result.rows?.length ?? (Array.isArray(result) ? result.length : 0);
  if (recoveredCount > 0) {
    logger.info({ recoveredCount }, `Recovered ${recoveredCount} stale sending jobs from outbox`);
  }
  return recoveredCount;
}

/**
 * Atomically claims a chunk of pending queue items using FOR UPDATE SKIP LOCKED.
 */
async function claimQueueChunk(batchSize: number): Promise<ClaimedQueueItem[]> {
  return await db.transaction(async (tx) => {
    const claimRes: any = await tx.execute(sql`
      SELECT 
        id, 
        batch_id as "batchId", 
        company_id as "companyId", 
        invitation_id as "invitationId",
        recipient_email as "recipientEmail", 
        recipient_name as "recipientName",
        encrypted_raw_token as "encryptedRawToken", 
        retry_count as "retryCount", 
        max_retries as "maxRetries"
      FROM invitation_email_queue
      WHERE status = 'queued' AND next_attempt_at <= NOW()
      ORDER BY created_at ASC
      LIMIT ${batchSize}
      FOR UPDATE SKIP LOCKED
    `);

    const items: ClaimedQueueItem[] = claimRes.rows ?? claimRes ?? [];
    if (items.length === 0) {
      return [];
    }

    const itemIds = items.map((i) => i.id);
    await tx.execute(sql`
      UPDATE invitation_email_queue
      SET 
        status = 'sending',
        claimed_at = NOW(),
        last_attempt_at = NOW(),
        updated_at = NOW()
      WHERE id = ANY(${itemIds})
    `);

    return items;
  });
}

/**
 * Process a chunk of queued invitation emails from the database outbox.
 */
export async function processInvitationQueueChunk(
  options: DispatchWorkerOptions = {}
): Promise<DispatchRunResult> {
  const batchSize = options.batchSize || 50;
  const baseUrl =
    options.originBaseUrl ||
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://app.elevio.mu";

  // 1. Recover any stale claims first
  const recoveredStale = await recoverStaleSendingJobs();

  // 2. Claim available queued items atomically
  const queueItems = await claimQueueChunk(batchSize);

  if (queueItems.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0, transientRetries: 0, recoveredStale };
  }

  let succeeded = 0;
  let failed = 0;
  let transientRetries = 0;

  for (const item of queueItems) {
    try {
      // 3. Fetch invitation and company details
      const [inv] = await db
        .select()
        .from(employeeInvitationsTable)
        .where(eq(employeeInvitationsTable.id, item.invitationId))
        .limit(1);

      if (!inv || inv.status === "revoked" || inv.status === "accepted") {
        // Invitation no longer eligible — mark failed and purge token
        await db
          .update(invitationEmailQueueTable)
          .set({
            status: "failed",
            encryptedRawToken: null,
            claimedAt: null,
            failureReason: inv ? `Invitation is already ${inv.status}` : "Invitation record not found",
            updatedAt: new Date(),
          })
          .where(eq(invitationEmailQueueTable.id, item.id));
        failed++;
        continue;
      }

      const [company] = await db
        .select({ name: companiesTable.name })
        .from(companiesTable)
        .where(eq(companiesTable.id, item.companyId))
        .limit(1);

      const companyName = company?.name || "Elevio Corporate";

      // 4. Decrypt raw token for link generation (if present)
      let rawToken: string | null = null;
      if (item.encryptedRawToken) {
        try {
          rawToken = decryptToken(item.encryptedRawToken);
        } catch (decryptErr: any) {
          logger.warn(
            { queueItemId: item.id, err: decryptErr?.message },
            "Failed to decrypt invitation token from queue; falling back to generic join URL"
          );
        }
      }

      const invitationLink = rawToken
        ? `${baseUrl}/join?token=${encodeURIComponent(rawToken)}`
        : `${baseUrl}/join`;

      // 5. Dispatch via notification delivery service
      const delivery = await dispatchNotificationDelivery({
        companyId: item.companyId,
        recipientEmail: item.recipientEmail,
        recipientName: item.recipientName,
        notificationType: "invitation",
        deduplicationKey: `bulk_queue_${item.id}_${inv.id}_attempt_${item.retryCount}`,
        templateData: {
          companyName,
          actionUrl: invitationLink,
          invitationLink,
          expiresAt: inv.expiresAt,
        },
      });

      if (delivery.delivered || delivery.status === "delivered") {
        // Successful delivery — mark sent and nullify encrypted raw token for security
        await db
          .update(invitationEmailQueueTable)
          .set({
            status: "sent",
            encryptedRawToken: null,
            claimedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(invitationEmailQueueTable.id, item.id));
        succeeded++;

        // Update batch sent count if part of a batch
        if (item.batchId) {
          await db
            .update(bulkInvitationBatchesTable)
            .set({
              sentCount: sql`${bulkInvitationBatchesTable.sentCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(bulkInvitationBatchesTable.id, item.batchId));
        }
      } else {
        // Transient or permanent failure
        const isPermanent =
          delivery.reason?.includes("INVALID") ||
          delivery.reason?.includes("does not belong");
        const nextRetry = item.retryCount + 1;

        if (isPermanent || nextRetry >= item.maxRetries) {
          await db
            .update(invitationEmailQueueTable)
            .set({
              status: "failed",
              encryptedRawToken: null,
              claimedAt: null,
              retryCount: nextRetry,
              failureReason: delivery.reason || "Delivery failed",
              updatedAt: new Date(),
            })
            .where(eq(invitationEmailQueueTable.id, item.id));
          failed++;

          if (item.batchId) {
            await db
              .update(bulkInvitationBatchesTable)
              .set({
                failedCount: sql`${bulkInvitationBatchesTable.failedCount} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(bulkInvitationBatchesTable.id, item.batchId));
          }
        } else {
          // Exponential backoff: 10s, 40s, 90s
          const backoffSeconds = Math.pow(nextRetry, 2) * 10;
          const nextAttempt = new Date(Date.now() + backoffSeconds * 1000);

          await db
            .update(invitationEmailQueueTable)
            .set({
              status: "queued",
              claimedAt: null,
              retryCount: nextRetry,
              nextAttemptAt: nextAttempt,
              failureReason: delivery.reason || "Temporary dispatch failure; queued for retry",
              updatedAt: new Date(),
            })
            .where(eq(invitationEmailQueueTable.id, item.id));
          transientRetries++;
        }
      }
    } catch (err: any) {
      logger.warn({ err: err?.message, queueItemId: item.id }, "Unexpected error processing queue item");
      const nextRetry = item.retryCount + 1;
      if (nextRetry >= item.maxRetries) {
        await db
          .update(invitationEmailQueueTable)
          .set({
            status: "failed",
            encryptedRawToken: null,
            claimedAt: null,
            retryCount: nextRetry,
            failureReason: err?.message || "Execution exception",
            updatedAt: new Date(),
          })
          .where(eq(invitationEmailQueueTable.id, item.id));
        failed++;
      } else {
        const nextAttempt = new Date(Date.now() + Math.pow(nextRetry, 2) * 10000);
        await db
          .update(invitationEmailQueueTable)
          .set({
            status: "queued",
            claimedAt: null,
            retryCount: nextRetry,
            nextAttemptAt: nextAttempt,
            failureReason: err?.message || "Execution exception",
            updatedAt: new Date(),
          })
          .where(eq(invitationEmailQueueTable.id, item.id));
        transientRetries++;
      }
    }
  }

  // Update batch overall status if all items are processed
  const activeBatchIds = Array.from(
    new Set(queueItems.map((q) => q.batchId).filter(Boolean))
  ) as number[];

  for (const bId of activeBatchIds) {
    const [pendingInBatch] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invitationEmailQueueTable)
      .where(
        and(
          eq(invitationEmailQueueTable.batchId, bId),
          inArray(invitationEmailQueueTable.status, ["queued", "sending"])
        )
      );

    if ((pendingInBatch?.count ?? 0) === 0) {
      await db
        .update(bulkInvitationBatchesTable)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(bulkInvitationBatchesTable.id, bId));
    }
  }

  return {
    processed: queueItems.length,
    succeeded,
    failed,
    transientRetries,
    recoveredStale,
  };
}

// ─── Lifecycle & Interval Runner ─────────────────────────────────────────────

let workerIntervalHandle: NodeJS.Timeout | null = null;
let isWorkerRunning = false;

export function startInvitationDispatchWorker(intervalMs: number = 15000): void {
  if (workerIntervalHandle) {
    return; // Already started
  }

  logger.info({ intervalMs }, "Starting durable invitation dispatch worker loop");

  const runTick = async () => {
    if (isWorkerRunning) return;
    isWorkerRunning = true;
    try {
      await processInvitationQueueChunk({ batchSize: 50 });
    } catch (err: any) {
      logger.error({ err: err?.message }, "Error during invitation dispatch worker loop iteration");
    } finally {
      isWorkerRunning = false;
    }
  };

  // Immediate first run
  setImmediate(runTick);

  // Periodic timer
  workerIntervalHandle = setInterval(runTick, intervalMs);

  // Graceful shutdown hooks
  const handleShutdown = () => {
    stopInvitationDispatchWorker();
  };

  process.once("SIGTERM", handleShutdown);
  process.once("SIGINT", handleShutdown);
}

export function stopInvitationDispatchWorker(): void {
  if (workerIntervalHandle) {
    clearInterval(workerIntervalHandle);
    workerIntervalHandle = null;
    logger.info("Invitation dispatch worker stopped gracefully");
  }
}
