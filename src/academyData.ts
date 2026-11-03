export type Student = {
  id: string;
  name: string;
  grade: string;
  initials: string;
  color: string;
};

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  points: number;
};

export type AcademyData = {
  students: Student[];
  assignments: Assignment[];
  completions: Record<string, string[]>;
};

export const STORAGE_KEY = "royal-minds-academy:v1";

export const starterData: AcademyData = {
  students: [
    { id: "maya", name: "Maya Chen", grade: "Grade 5", initials: "MC", color: "coral" },
    { id: "eli", name: "Eli Thompson", grade: "Grade 5", initials: "ET", color: "blue" },
    { id: "zoe", name: "Zoe Patel", grade: "Grade 5", initials: "ZP", color: "green" },
    { id: "noah", name: "Noah Williams", grade: "Grade 5", initials: "NW", color: "violet" },
  ],
  assignments: [
    {
      id: "fractions",
      title: "Fraction detectives",
      subject: "Math",
      description: "Find three examples of fractions at home and show how you know.",
      dueDate: "2026-11-06",
      points: 20,
    },
    {
      id: "reading",
      title: "A story worth sharing",
      subject: "Reading",
      description: "Read a chapter of your choice and write down your favorite moment.",
      dueDate: "2026-11-08",
      points: 15,
    },
    {
      id: "science",
      title: "Tiny garden journal",
      subject: "Science",
      description: "Observe a plant for a few minutes and sketch what you notice.",
      dueDate: "2026-11-10",
      points: 25,
    },
    {
      id: "community",
      title: "Our helpful community",
      subject: "Social Studies",
      description: "Draw or describe one way people help make your neighborhood better.",
      dueDate: "2026-11-12",
      points: 20,
    },
  ],
  completions: {
    maya: ["reading"],
    eli: ["fractions", "reading"],
    zoe: ["fractions", "science"],
    noah: ["reading", "community"],
  },
};

export function createStarterData(): AcademyData {
  return JSON.parse(JSON.stringify(starterData)) as AcademyData;
}

function isAcademyData(value: unknown): value is AcademyData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AcademyData>;
  return (
    Array.isArray(data.students) &&
    Array.isArray(data.assignments) &&
    !!data.completions &&
    typeof data.completions === "object" &&
    data.students.every(
      (student) =>
        student &&
        typeof student.id === "string" &&
        typeof student.name === "string" &&
        typeof student.grade === "string" &&
        typeof student.initials === "string" &&
        typeof student.color === "string",
    ) &&
    data.assignments.every(
      (assignment) =>
        assignment &&
        typeof assignment.id === "string" &&
        typeof assignment.title === "string" &&
        typeof assignment.subject === "string" &&
        typeof assignment.description === "string" &&
        typeof assignment.dueDate === "string" &&
        typeof assignment.points === "number",
    ) &&
    Object.values(data.completions).every(
      (ids) => Array.isArray(ids) && ids.every((id) => typeof id === "string"),
    )
  );
}

export function readAcademyData(storage?: Storage): AcademyData {
  let saved: string | null;
  try {
    saved = (storage ?? window.localStorage).getItem(STORAGE_KEY);
  } catch {
    throw new Error("Saved classroom data could not be read from this browser.");
  }
  if (!saved) return createStarterData();

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!isAcademyData(parsed)) throw new Error("Saved classroom data has an unexpected format.");
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message === "Saved classroom data has an unexpected format.") {
      throw error;
    }
    throw new Error("Saved classroom data is unreadable. Restore the starter classroom to continue.");
  }
}

export function writeAcademyData(data: AcademyData, storage?: Storage): void {
  try {
    (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    throw new Error("Changes could not be saved. Check this browser's storage settings and available space.");
  }
}

export function toggleCompletion(
  completions: AcademyData["completions"],
  studentId: string,
  assignmentId: string,
): AcademyData["completions"] {
  const current = completions[studentId] ?? [];
  const next = current.includes(assignmentId)
    ? current.filter((id) => id !== assignmentId)
    : [...current, assignmentId];
  return { ...completions, [studentId]: next };
}
