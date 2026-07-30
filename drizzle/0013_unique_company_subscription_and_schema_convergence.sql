-- Safe duplicate resolution before constraint creation
DELETE FROM "company_subscriptions" cs1
USING "company_subscriptions" cs2
WHERE cs1."company_id" = cs2."company_id"
  AND (
    (cs1."status" NOT IN ('ACTIVE', 'PENDING') AND cs2."status" IN ('ACTIVE', 'PENDING'))
    OR (
      (cs1."status" IN ('ACTIVE', 'PENDING') = cs2."status" IN ('ACTIVE', 'PENDING'))
      AND (
        cs1."updated_at" < cs2."updated_at"
        OR (cs1."updated_at" = cs2."updated_at" AND cs1."id" < cs2."id")
      )
    )
  );

--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_company_subscription'
  ) THEN
    ALTER TABLE "company_subscriptions" ADD CONSTRAINT "unique_company_subscription" UNIQUE("company_id");
  END IF;
END $$;
