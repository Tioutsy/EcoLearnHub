export function isValidSectorSlug(slug: string): boolean {
  return /^[a-z0-9-_]+$/.test(slug);
}

export function hasDuplicateCourses(courseIds: number[]): boolean {
  return new Set(courseIds).size !== courseIds.length;
}

export function hasDuplicatePositions(positions: number[]): boolean {
  return new Set(positions).size !== positions.length;
}

export function isSelfPrerequisite(courseId: number, prerequisiteIds: number[]): boolean {
  return prerequisiteIds.includes(courseId);
}

export function isAllowedSdgContribution(category: string): boolean {
  const allowed = ["education_awareness", "capacity_building"];
  return allowed.includes(category);
}
