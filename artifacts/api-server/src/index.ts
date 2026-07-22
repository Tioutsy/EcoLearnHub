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
import { ensureEsgBasicsCourse } from "./lib/ensureEsgBasicsCourse";
import { ensureEnvironmentalComplianceCourse } from "./lib/ensureEnvironmentalComplianceCourse";
import { ensureCircularEconomyCourse } from "./lib/ensureCircularEconomyCourse";
import { ensureFinalSustainabilityCertificationCourse } from "./lib/ensureFinalSustainabilityCertificationCourse";
import { ensureActionPlanningCourse } from "./lib/ensureActionPlanningCourse";
import { seedInitialSectors } from "./routes/platformAdmin";
import { ensureCatalogueSkeletons } from "./lib/ensureCatalogueSkeletons";
import { ensureCoreSustainabilityPath } from "./lib/ensureCoreSustainabilityPath";
import { ensureDefaultCompany } from "./lib/ensureDefaultCompany";
import { ensurePlans } from "./lib/ensurePlans";
import { ensureChallenges } from "./lib/ensureChallenges";
import { ensureAchievementDefinitions } from "./lib/achievementsService";
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


import { ensureSchemaModifications } from "./lib/ensureSchemaModifications";

async function start(): Promise<void> {
  // Ensure any schema modifications that were missed by the remote migration runner are applied
  await ensureSchemaModifications();

  // Synchronize auto-increment sequences with actual table data
  await syncSequences();

  // Seed plans if table is empty
  await ensurePlans();

  // Seed default company if none exists
  await ensureDefaultCompany();

  // Seed challenges
  await ensureChallenges();

  // Seed achievement definitions
  await ensureAchievementDefinitions();

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
  await ensureEsgBasicsCourse();
  await ensureEnvironmentalComplianceCourse();
  await ensureCircularEconomyCourse();
  await seedInitialSectors();
  await ensureCatalogueSkeletons();
  await ensureFinalSustainabilityCertificationCourse();
  await ensureActionPlanningCourse();
  await ensureCoreSustainabilityPath();
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

