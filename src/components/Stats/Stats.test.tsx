import { render } from "@testing-library/react";
import Stats from "./Stats";

describe("Stats component", () => {
  it("renders the correct number of stats", () => {
    const stats = [
      { value: 10, label: "Users" },
      { value: 20, label: "Posts" },
      { value: "30%", label: "Growth" },
      { value: 5, label: "Comments" },
    ];
    const { container } = render(<Stats stats={stats} />);
    const statElements = container.querySelectorAll(".text-center");
    expect(statElements.length).toBe(stats.length);
  });

  it("renders stat values and labels correctly", () => {
    const stats = [
      { value: 42, label: "Answers" },
      { value: "99%", label: "Satisfaction" },
    ];
    const { getByText } = render(<Stats stats={stats} />);
    expect(getByText("42")).toBeInTheDocument();
    expect(getByText("Answers")).toBeInTheDocument();
    expect(getByText("99%")).toBeInTheDocument();
    expect(getByText("Satisfaction")).toBeInTheDocument();
  });

  it("renders nothing if stats array is empty", () => {
    const { container } = render(<Stats stats={[]} />);
    expect(container.querySelectorAll(".text-center").length).toBe(0);
  });

  it("applies correct class names for styling", () => {
    const stats = [{ value: 1, label: "Test" }];
    const { container } = render(<Stats stats={stats} />);
    expect(container.firstChild).toHaveClass(
      "grid",
      "grid-cols-2",
      "md:grid-cols-4",
      "gap-8",
      "max-w-2xl",
      "mx-auto"
    );
    const statDiv = container.querySelector(".text-center");
    expect(statDiv).toBeInTheDocument();
    expect(statDiv?.querySelector(".text-2xl")).toBeInTheDocument();
    expect(statDiv?.querySelector(".text-sm")).toBeInTheDocument();
  });
});
