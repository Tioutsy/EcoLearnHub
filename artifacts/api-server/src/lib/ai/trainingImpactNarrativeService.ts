import { getCompanyImpactSummary } from "../learnerCommitmentService.js";

export interface ImpactNarrativeResult {
  summaryInterpretation: string;
  keyStrengthsAndGaps: string;
  suggestedManagementActions: string[];
  isAiGenerated: boolean;
  disclaimer: string;
}

export function generateDeterministicImpactNarrative(summary: Awaited<ReturnType<typeof getCompanyImpactSummary>>): ImpactNarrativeResult {
  const { commitmentRate, actionFollowThroughRate, commitmentsCreated, managerConfirmedActions, outstandingManagerReviews } = summary;

  let interpretation = "";
  if (commitmentsCreated === 0) {
    interpretation = "Training completion is progressing, but no workplace commitments have been recorded yet. Encouraging learners to select one practical action upon course completion will build initial momentum.";
  } else if (actionFollowThroughRate < 0.2) {
    interpretation = `Learners have created ${commitmentsCreated} workplace commitments, with a initial commitment rate of ${(commitmentRate * 100).toFixed(1)}%. However, follow-through reports remain low (${(actionFollowThroughRate * 100).toFixed(1)}%). Managers can boost engagement by reviewing progress during regular check-ins.`;
  } else {
    interpretation = `Strong workplace engagement observed. Learners have recorded ${commitmentsCreated} commitments with a ${(actionFollowThroughRate * 100).toFixed(1)}% follow-through rate. ${managerConfirmedActions} reported actions have been reviewed and confirmed by managers.`;
  }

  const strengthsGaps = `Commitment Rate: ${(commitmentRate * 100).toFixed(1)}% | Follow-Through Rate: ${(actionFollowThroughRate * 100).toFixed(1)}% | Outstanding Reviews: ${outstandingManagerReviews}.`;

  const suggestions: string[] = [];
  if (outstandingManagerReviews > 0) {
    suggestions.push(`Review the ${outstandingManagerReviews} submitted employee action reports in the Training Impact queue.`);
  }
  if (commitmentRate < 0.5) {
    suggestions.push("Prompt team leads to highlight the optional post-training commitment step during team briefings.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Maintain current follow-up cadence and share successful workplace practices across teams.");
  }

  return {
    summaryInterpretation: interpretation,
    keyStrengthsAndGaps: strengthsGaps,
    suggestedManagementActions: suggestions,
    isAiGenerated: false,
    disclaimer: "Interpretation is generated deterministically from company aggregate statistics. Does not constitute an environmental audit.",
  };
}

export async function generateCompanyImpactNarrative(companyId: number): Promise<ImpactNarrativeResult> {
  const summary = await getCompanyImpactSummary(companyId);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    return generateDeterministicImpactNarrative(summary);
  }

  try {
    // Attempt Gemini call if API key exists
    const prompt = `Analyze the following company training impact summary deterministically. Do NOT claim carbon savings or environmental audit verification. Do NOT discipline employees.
Metrics:
- Commitment Rate: ${(summary.commitmentRate * 100).toFixed(1)}%
- Action Follow-Through Rate: ${(summary.actionFollowThroughRate * 100).toFixed(1)}%
- Manager Confirmed Actions: ${summary.managerConfirmedActions}
- Outstanding Manager Reviews: ${summary.outstandingManagerReviews}
- Category Breakdown: ${JSON.stringify(summary.categoryDistribution)}

Provide a concise JSON response matching:
{
  "summaryInterpretation": "string",
  "keyStrengthsAndGaps": "string",
  "suggestedManagementActions": ["string"]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) {
      return generateDeterministicImpactNarrative(summary);
    }

    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return generateDeterministicImpactNarrative(summary);
    }

    const parsed = JSON.parse(text);
    return {
      summaryInterpretation: parsed.summaryInterpretation || generateDeterministicImpactNarrative(summary).summaryInterpretation,
      keyStrengthsAndGaps: parsed.keyStrengthsAndGaps || generateDeterministicImpactNarrative(summary).keyStrengthsAndGaps,
      suggestedManagementActions: Array.isArray(parsed.suggestedManagementActions) ? parsed.suggestedManagementActions.slice(0, 3) : generateDeterministicImpactNarrative(summary).suggestedManagementActions,
      isAiGenerated: true,
      disclaimer: "AI-assisted interpretation generated from aggregate training metrics. Does not represent an environmental audit.",
    };
  } catch {
    return generateDeterministicImpactNarrative(summary);
  }
}
