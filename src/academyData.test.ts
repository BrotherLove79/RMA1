import { beforeEach, describe, expect, it } from "vitest";
import {
  createStarterData,
  readAcademyData,
  STORAGE_KEY,
  toggleCompletion,
  writeAcademyData,
} from "./academyData";

describe("academy classroom data", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the sample class when no saved data exists", () => {
    const data = readAcademyData();

    expect(data.students).toHaveLength(4);
    expect(data.assignments.length).toBeGreaterThan(0);
  });

  it("round-trips edits through browser storage", () => {
    const data = createStarterData();
    data.assignments[0].title = "Updated assignment";
    writeAcademyData(data);

    expect(readAcademyData().assignments[0].title).toBe("Updated assignment");
  });

  it("reports corrupted saved data instead of silently replacing it", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json");

    expect(() => readAcademyData()).toThrow("Saved classroom data is unreadable");
  });

  it("toggles one student's completion without changing another student's record", () => {
    const current = { maya: ["reading"], eli: ["fractions"] };
    const next = toggleCompletion(current, "maya", "fractions");

    expect(next.maya).toEqual(["reading", "fractions"]);
    expect(next.eli).toEqual(["fractions"]);
  });
});
