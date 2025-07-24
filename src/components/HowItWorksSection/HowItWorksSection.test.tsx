import React from "react";
import { render, screen } from "@testing-library/react";
import HowItWorksSection from "./HowItWorksSection";

describe("HowItWorksSection", () => {
  it("renders the section title and description", () => {
    render(<HowItWorksSection />);
    expect(
      screen.getByRole("heading", { name: /how it works/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/get started in three simple steps/i)
    ).toBeInTheDocument();
  });

  it("renders all three steps with correct titles and descriptions", () => {
    render(<HowItWorksSection />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Choose Your Preferences")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Select your difficulty level, preferred categories, and enter your player name./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Answer Questions")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Respond to AI-generated questions with real-time feedback and scoring./i
      )
    ).toBeInTheDocument();

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Track Your Progress")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Monitor your scores, streaks, and improvement across different categories./i
      )
    ).toBeInTheDocument();
  });

  it("renders ArrowRight icon for the first two steps only", () => {
    render(<HowItWorksSection />);
    const arrowIcons = screen.getAllByTestId("lucide-arrow-right");
    expect(arrowIcons).toHaveLength(2);
  });
});
