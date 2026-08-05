/**
 * Sorts courses by courseCode in numerical order (e.g. ELH-01, ELH-02, ..., ELH-09, ELH-10, ..., ELH-29).
 * Non-ELH codes are placed after valid ELH codes, sorted alphabetically.
 * Courses with missing or null courseCodes are placed at the very end.
 */
export function sortCoursesByCode<T extends { courseCode?: string | null; title?: string | null }>(
  courses: T[]
): T[] {
  if (!courses || !Array.isArray(courses)) return [];

  return [...courses].sort((a, b) => {
    const codeA = a.courseCode?.trim().toUpperCase() ?? "";
    const codeB = b.courseCode?.trim().toUpperCase() ?? "";

    // If both missing code, fallback to title comparison
    if (!codeA && !codeB) {
      return (a.title ?? "").localeCompare(b.title ?? "");
    }
    if (!codeA) return 1;
    if (!codeB) return -1;

    const matchA = codeA.match(/^ELH-(\d+)$/);
    const matchB = codeB.match(/^ELH-(\d+)$/);

    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      return numA - numB;
    }

    if (matchA) return -1;
    if (matchB) return 1;

    // Fallback lexical sort for non-ELH codes
    return codeA.localeCompare(codeB);
  });
}
