import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { readAcademyData } from "./academyData";

describe("Royal Minds Academy app", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("lets a student mark work complete and saves the progress", async () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Good morning, Maya/i })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /Mark complete/i })[0]);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Done/i })).toHaveLength(2);
    });
    await waitFor(() => {
      expect(readAcademyData().completions.maya).toContain("fractions");
    });
  });

  it("lets a teacher create, edit, and delete an assignment", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Teacher" }));
    fireEvent.click(screen.getByRole("button", { name: /New assignment/i }));

    fireEvent.change(screen.getByLabelText("Assignment title"), {
      target: { value: "Book report reflection" },
    });
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-11-18" },
    });
    fireEvent.change(screen.getByLabelText("Instructions"), {
      target: { value: "Share your favorite part of a book." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create assignment/i }));

    expect(await screen.findByText("Book report reflection")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit Book report reflection" }));
    fireEvent.change(screen.getByLabelText("Assignment title"), {
      target: { value: "Book reflection" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    expect(await screen.findByText("Book reflection")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete Book reflection" }));

    await waitFor(() => {
      expect(screen.queryByText("Book reflection")).not.toBeInTheDocument();
      expect(readAcademyData().assignments.some((item) => item.title === "Book reflection")).toBe(false);
    });
  });
});
