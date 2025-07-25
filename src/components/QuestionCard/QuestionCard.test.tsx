import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard, { QuestionData } from "./QuestionCard";

const mockQuestion: QuestionData = {
  id: "test-question-1",
  question: "What is the capital of France?",
  options: ["A. London", "B. Berlin", "C. Paris", "D. Madrid"],
  correctAnswer: "C",
  category: "Geography",
  difficulty: "easy",
};

describe("QuestionCard", () => {
  const defaultProps = {
    question: mockQuestion,
    onAnswerSelect: jest.fn(),
    isSubmitted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the question and all options", () => {
    render(<QuestionCard {...defaultProps} />);

    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("displays category and difficulty", () => {
    render(<QuestionCard {...defaultProps} />);

    expect(screen.getByText("Geography")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
  });

  it("calls onAnswerSelect when an option is clicked", () => {
    const onAnswerSelect = jest.fn();
    render(<QuestionCard {...defaultProps} onAnswerSelect={onAnswerSelect} />);

    fireEvent.click(screen.getByText("Paris"));
    expect(onAnswerSelect).toHaveBeenCalledWith("C");
  });

  it("highlights selected answer", () => {
    render(<QuestionCard {...defaultProps} selectedAnswer="C" />);

    const parisButton = screen.getByText("Paris").closest("button");
    expect(parisButton).toHaveClass("border-blue-500");
  });

  it("shows correct answer when submitted", () => {
    render(
      <QuestionCard {...defaultProps} selectedAnswer="B" isSubmitted={true} />
    );

    const correctButton = screen.getByText("Paris").closest("button");
    const incorrectButton = screen.getByText("Berlin").closest("button");

    expect(correctButton).toHaveClass("border-green-500");
    expect(incorrectButton).toHaveClass("border-red-500");
  });

  it("disables options when submitted", () => {
    render(<QuestionCard {...defaultProps} isSubmitted={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("displays timer when timeRemaining is provided", () => {
    render(<QuestionCard {...defaultProps} timeRemaining={90} />);

    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("shows timer in red when time is low", () => {
    render(<QuestionCard {...defaultProps} timeRemaining={5} />);

    const timer = screen.getByText("0:05");
    expect(timer).toHaveClass("text-red-600", "dark:text-red-400", "font-bold");
  });

  it("displays loading state", () => {
    const { container } = render(
      <QuestionCard {...defaultProps} isLoading={true} />
    );

    expect(container.firstChild).toHaveClass("animate-pulse");
    expect(
      screen.queryByText("What is the capital of France?")
    ).not.toBeInTheDocument();
  });

  it("shows instructions when not submitted", () => {
    render(<QuestionCard {...defaultProps} />);

    expect(
      screen.getByText("Select your answer and click submit to continue")
    ).toBeInTheDocument();
  });

  it("hides instructions when submitted", () => {
    render(<QuestionCard {...defaultProps} isSubmitted={true} />);

    expect(
      screen.queryByText("Select your answer and click submit to continue")
    ).not.toBeInTheDocument();
  });

  it("handles options without letter prefixes", () => {
    const questionWithoutPrefixes: QuestionData = {
      ...mockQuestion,
      options: ["London", "Berlin", "Paris", "Madrid"],
    };

    render(
      <QuestionCard {...defaultProps} question={questionWithoutPrefixes} />
    );

    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("displays correct difficulty colors", () => {
    const hardQuestion: QuestionData = { ...mockQuestion, difficulty: "hard" };
    const mediumQuestion: QuestionData = {
      ...mockQuestion,
      difficulty: "medium",
    };

    const { rerender } = render(
      <QuestionCard {...defaultProps} question={hardQuestion} />
    );
    expect(screen.getByText("Hard")).toHaveClass("text-red-600");

    rerender(<QuestionCard {...defaultProps} question={mediumQuestion} />);
    expect(screen.getByText("Medium")).toHaveClass("text-yellow-600");
  });

  it("shows checkmarks and X marks for correct/incorrect answers when submitted", () => {
    render(
      <QuestionCard {...defaultProps} selectedAnswer="B" isSubmitted={true} />
    );

    // Check that the correct answer (Paris) has a checkmark icon
    const correctButton = screen.getByText("Paris").closest("button");
    const checkmarkIcon = correctButton?.querySelector("svg");
    expect(checkmarkIcon).toBeInTheDocument();
    expect(correctButton).toHaveClass("border-green-500");

    // Check that the selected incorrect answer (Berlin) has an X mark icon
    const incorrectButton = screen.getByText("Berlin").closest("button");
    const xMarkIcon = incorrectButton?.querySelector("svg");
    expect(xMarkIcon).toBeInTheDocument();
    expect(incorrectButton).toHaveClass("border-red-500");
  });

  it("formats timer correctly for different time values", () => {
    const { rerender } = render(
      <QuestionCard {...defaultProps} timeRemaining={125} />
    );
    expect(screen.getByText("2:05")).toBeInTheDocument();

    rerender(<QuestionCard {...defaultProps} timeRemaining={5} />);
    expect(screen.getByText("0:05")).toBeInTheDocument();

    rerender(<QuestionCard {...defaultProps} timeRemaining={0} />);
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });
});
