import React from "react";
import { render, screen } from "@testing-library/react";
import GameInstructions from "./GameInstructions";

describe("GameInstructions", () => {
  it("renders the instructions container", () => {
    render(<GameInstructions />);
    const container = screen.getByRole("heading", { name: /how to play/i });
    expect(container).toBeInTheDocument();
  });

  it("renders all instruction steps", () => {
    render(<GameInstructions />);
    expect(screen.getByText(/1\. Answer Questions:/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Watch Your Score:/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Build Streaks:/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Learn & Improve:/i)).toBeInTheDocument();
  });

  it("renders the correct explanations for each step", () => {
    render(<GameInstructions />);
    expect(
      screen.getByText(/Select your answer from the multiple choice options/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The scoreboard updates instantly with your progress/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Get consecutive correct answers for bonus points/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Read AI explanations after each answer/i)
    ).toBeInTheDocument();
  });
});
