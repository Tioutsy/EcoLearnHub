import { ensureSchemaModifications } from "./ensureSchemaModifications";
import { ensureFoundationsCourse } from "./ensureFoundationsCourse";
import { ensureWasteSortingCourse } from "./ensureWasteSortingCourse";
import { ensureEnergyEfficiencyCourse } from "./ensureEnergyEfficiencyCourse";
import { ensureWaterConservationCourse } from "./ensureWaterConservationCourse";
import { ensureSustainableProcurementCourse } from "./ensureSustainableProcurementCourse";
import { ensureGreenOfficePracticesCourse } from "./ensureGreenOfficePracticesCourse";
import { ensureCarbonFootprintCourse } from "./ensureCarbonFootprintCourse";
import { ensureBiodiversityCourse } from "./ensureBiodiversityCourse";
import { ensureEsgBasicsCourse } from "./ensureEsgBasicsCourse";
import { ensureEnvironmentalComplianceCourse } from "./ensureEnvironmentalComplianceCourse";
import { ensureCircularEconomyCourse } from "./ensureCircularEconomyCourse";
import { ensureFinalSustainabilityCertificationCourse } from "./ensureFinalSustainabilityCertificationCourse";
import { ensureActionPlanningCourse } from "./ensureActionPlanningCourse";
import { ensureDepartmentalSustainabilityGoalsCourse } from "./ensureDepartmentalSustainabilityGoalsCourse";
import { ensureWorkplaceSustainabilityTeamCourse } from "./ensureWorkplaceSustainabilityTeamCourse";
import { ensureCommunicatingSustainabilityAtWorkCourse } from "./ensureCommunicatingSustainabilityAtWorkCourse";
import { ensureTrackingSustainabilityActionsCourse } from "./ensureTrackingSustainabilityActionsCourse";
import { ensureSustainabilityDataCollectionCourse } from "./ensureSustainabilityDataCollectionCourse";
import { ensureSustainabilityPerformanceReviewCourse } from "./ensureSustainabilityPerformanceReviewCourse";
import { ensureSustainabilityRolesAccountabilityCourse } from "./ensureSustainabilityRolesAccountabilityCourse";
import { ensureEmployeeSustainabilityEngagementCourse } from "./ensureEmployeeSustainabilityEngagementCourse";
import { ensureEffectiveGreenTeamsCourse } from "./ensureEffectiveGreenTeamsCourse";
import { ensureWorkplaceSustainabilityInitiativesCourse } from "./ensureWorkplaceSustainabilityInitiativesCourse";
import { ensureSustainabilityForHrTeamsCourse } from "./ensureSustainabilityForHrTeamsCourse";
import { ensureSustainabilityForFinanceTeamsCourse } from "./ensureSustainabilityForFinanceTeamsCourse";
import { ensureSustainabilityForFacilitiesAndPropertyTeamsCourse } from "./ensureSustainabilityForFacilitiesAndPropertyTeamsCourse";
import { ensureSustainabilityForSalesAndMarketingTeamsCourse } from "./ensureSustainabilityForSalesAndMarketingTeamsCourse";
import { ensureSustainabilityForOperationsAndFrontlineTeamsCourse } from "./ensureSustainabilityForOperationsAndFrontlineTeamsCourse";
import { ensureSustainabilityForProcurementAndPurchasingTeamsCourse } from "./ensureSustainabilityForProcurementAndPurchasingTeamsCourse";
import { auditFullCatalogueQuizDistribution } from "./auditQuizAnswerDistribution";

async function main() {
  console.log("Seeding all courses to ensure database contains active definitions...");
  await ensureSchemaModifications();
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
  await ensureFinalSustainabilityCertificationCourse();
  await ensureActionPlanningCourse();
  await ensureDepartmentalSustainabilityGoalsCourse();
  await ensureWorkplaceSustainabilityTeamCourse();
  await ensureCommunicatingSustainabilityAtWorkCourse();
  await ensureTrackingSustainabilityActionsCourse();
  await ensureSustainabilityDataCollectionCourse();
  await ensureSustainabilityPerformanceReviewCourse();
  await ensureSustainabilityRolesAccountabilityCourse();
  await ensureEmployeeSustainabilityEngagementCourse();
  await ensureEffectiveGreenTeamsCourse();
  await ensureWorkplaceSustainabilityInitiativesCourse();
  await ensureSustainabilityForHrTeamsCourse();
  await ensureSustainabilityForFinanceTeamsCourse();
  await ensureSustainabilityForFacilitiesAndPropertyTeamsCourse();
  await ensureSustainabilityForSalesAndMarketingTeamsCourse();
  await ensureSustainabilityForOperationsAndFrontlineTeamsCourse();
  await ensureSustainabilityForProcurementAndPurchasingTeamsCourse();

  console.log("\nRunning Full Catalogue Quiz Answer Distribution Audit...\n");
  const audit = await auditFullCatalogueQuizDistribution();
  console.log("=== CATALOGUE QUIZ AUDIT RESULTS ===");
  console.log(`Total Courses Scanned: ${audit.totalCourses}`);
  console.log(`Total Questions Scanned: ${audit.totalQuestions}`);
  console.log("Overall Position Counts (0=P1, 1=P2, 2=P3, 3=P4):", audit.overallPositionCounts);
  console.log("Overall Position Percentages:", audit.overallPositionPercentages);
  console.log("\nPer-Course Breakdown:");
  for (const c of audit.courses) {
    console.log(
      `${c.courseCode} (${c.totalQuestions} questions): P1=${c.positionCounts[0]}, P2=${c.positionCounts[1]}, P3=${c.positionCounts[2]}, P4=${c.positionCounts[3]} | Longest Streak: ${c.longestStreak.streakLength} at P${c.longestStreak.position + 1} ${c.isBiased ? "❌ BIASED" : "✅ BALANCED"}`
    );
    if (c.warnings.length > 0) {
      console.log(`   Warnings: ${c.warnings.join(" | ")}`);
    }
  }
}

main().catch(console.error);
