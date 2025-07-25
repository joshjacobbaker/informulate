import React from "react";
import { render, screen } from "@testing-library/react";
import DemoPage from "./page";
import { fireEvent } from "@testing-library/react";

describe("DemoPage", () => {
  it("renders without crashing", () => {
    render(<DemoPage />);
    // Replace the below with actual text or elements from your DemoPage
    expect(screen.getByText(/Question Card Demo/i)).toBeInTheDocument();
  });

  it("shows the first question and its options", () => {
    render(<DemoPage />);
    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("shows the correct difficulty and category", () => {
    render(<DemoPage />);
    expect(screen.getByText(/Difficulty:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/easy/i)).toHaveLength(2);
    expect(screen.getAllByText(/Geography/i)).toHaveLength(2);
  });

  it("shows the Submit Answer button after selecting an answer", () => {
    render(<DemoPage />);
    // Simulate selecting an answer
    const option = screen.getByText("London");
    fireEvent.click(option);
    expect(screen.getByText(/Submit Answer/i)).toBeInTheDocument();
  });

  it("shows result after submitting an answer", () => {
    render(<DemoPage />);
    // Select and submit an answer
    const option = screen.getByText("London");
    fireEvent.click(option);
    const submitButton = screen.getByRole("button", { name: /submit answer/i });
    fireEvent.click(submitButton);
    // There may be multiple "Incorrect" messages, so use getAllByText and check length or presence
    expect(screen.getAllByText(/Incorrect/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/The correct answer was C/i)).toBeInTheDocument();
  });

  it("shows correct result when correct answer is selected", () => {
    render(<DemoPage />);
    const option = screen.getByText("Paris");
    fireEvent.click(option);
    const submitButton = screen.getByRole("button", { name: /submit answer/i });
    fireEvent.click(submitButton);
    expect(screen.getAllByText(/Correct/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Well done! You got it right./i)
    ).toBeInTheDocument();
  });

  it("shows Next Question and Reset Demo buttons after submitting", () => {
    render(<DemoPage />);
    const option = screen.getByText("Paris");
    fireEvent.click(option);
    const submitButton = screen.getByRole("button", { name: /submit answer/i });
    fireEvent.click(submitButton);
    expect(screen.getByText(/Next Question/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset Demo/i)).toBeInTheDocument();
  });

  it("cycles to the next question when Next Question is clicked", () => {
    render(<DemoPage />);
    const option = screen.getByText("London");
    fireEvent.click(option);
    const submitButton = screen.getByRole("button", { name: /submit answer/i });
    fireEvent.click(submitButton);
    const nextButton = screen.getByText(/Next Question/i);
    fireEvent.click(nextButton);
    expect(
      screen.getByText(
        /Which programming language is known for its use in web development/i
      )
    ).toBeInTheDocument();
  });

  it("resets to the first question when Reset Demo is clicked", () => {
    render(<DemoPage />);
    // Go to next question
    const option = screen.getByText("London");
    fireEvent.click(option);
    const submitAnswer = screen.getByText(/Submit Answer/i);
    fireEvent.click(submitAnswer);
    screen.getByText(/Next Question/i).click();
    // Now reset
    screen.getByText(/Reset Demo/i).click();
    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
  });
});
