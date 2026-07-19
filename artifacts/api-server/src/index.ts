import app from "./app";
import { logger } from "./lib/logger";
import { ensureFoundationsCourse } from "./lib/ensureFoundationsCourse";
import { ensureWasteSortingCourse } from "./lib/ensureWasteSortingCourse";
import { ensureEnergyEfficiencyCourse } from "./lib/ensureEnergyEfficiencyCourse";
import { ensureWaterConservationCourse } from "./lib/ensureWaterConservationCourse";
import { ensureSustainableProcurementCourse } from "./lib/ensureSustainableProcurementCourse";
import { ensureGreenOfficePracticesCourse } from "./lib/ensureGreenOfficePracticesCourse";
import { ensureCarbonFootprintCourse } from "./lib/ensureCarbonFootprintCourse";
import { ensureBiodiversityCourse } from "./lib/ensureBiodiversityCourse";
import { seedInitialSectors } from "./routes/platformAdmin";
import { ensureCatalogueSkeletons } from "./lib/ensureCatalogueSkeletons";
import { ensureInsightsMigrated } from "./lib/ensureInsightsMigrated";
import { syncSequences } from "./lib/syncSequences";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}


async function start(): Promise<void> {
  // Synchronize auto-increment sequences with actual table data
  await syncSequences();

  // Ensure required course content exists before accepting traffic so the first
  // requests after a deploy deterministically see the seeded course.
  await ensureFoundationsCourse();
  await ensureWasteSortingCourse();
  await ensureEnergyEfficiencyCourse();
  await ensureWaterConservationCourse();
  await ensureSustainableProcurementCourse();
  await ensureGreenOfficePracticesCourse();
  await ensureCarbonFootprintCourse();
  await ensureBiodiversityCourse();
  await seedInitialSectors();
  await ensureCatalogueSkeletons();
  await ensureInsightsMigrated();


  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "Server listening on 0.0.0.0");
  });

  server.on("error", (err) => {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  });
}

void start();

