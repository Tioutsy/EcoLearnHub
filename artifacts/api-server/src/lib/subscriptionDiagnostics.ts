import { db, companySubscriptionsTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { logger } from "./logger";

export interface DuplicateSubscriptionReport {
  companyId: number;
  recordCount: number;
  retainedId: number;
  removedIds: number[];
}

/**
 * Detects and safely resolves duplicate company subscriptions by retaining
 * the single most relevant subscription record (prioritising ACTIVE/PENDING status
 * and latest update timestamp) and removing superseded duplicate records.
 */
export async function detectAndResolveDuplicateCompanySubscriptions(): Promise<DuplicateSubscriptionReport[]> {
  const allSubscriptions = await db
    .select()
    .from(companySubscriptionsTable)
    .orderBy(
      companySubscriptionsTable.companyId,
      desc(companySubscriptionsTable.updatedAt),
      desc(companySubscriptionsTable.id)
    );

  // Group by companyId
  const grouped = new Map<number, typeof allSubscriptions>();
  for (const sub of allSubscriptions) {
    const list = grouped.get(sub.companyId) || [];
    list.push(sub);
    grouped.set(sub.companyId, list);
  }

  const reports: DuplicateSubscriptionReport[] = [];

  for (const [companyId, subs] of grouped.entries()) {
    if (subs.length <= 1) continue;

    // Pick retained record: prefer ACTIVE or PENDING, then latest updatedAt / highest ID
    const activeOrPending = subs.filter(
      s => s.status === "ACTIVE" || s.status === "PENDING"
    );
    const candidatePool = activeOrPending.length > 0 ? activeOrPending : subs;
    const retained = candidatePool[0]!;

    const removedIds = subs.filter(s => s.id !== retained.id).map(s => s.id);

    logger.warn(
      {
        companyId,
        totalRecords: subs.length,
        retainedId: retained.id,
        removedIds,
      },
      "Duplicate company subscriptions detected. Cleaning up older records before applying uniqueness constraint."
    );

    if (removedIds.length > 0) {
      await db
        .delete(companySubscriptionsTable)
        .where(inArray(companySubscriptionsTable.id, removedIds));
    }

    reports.push({
      companyId,
      recordCount: subs.length,
      retainedId: retained.id,
      removedIds,
    });
  }

  return reports;
}
