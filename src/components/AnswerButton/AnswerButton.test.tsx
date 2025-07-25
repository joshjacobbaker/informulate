import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AnswerButton from "./AnswerButton";

describe("AnswerButton", () => {
  const defaultProps = {
    letter: "A",
    text: "Sample answer text",
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders letter and text correctly", () => {
    render(<AnswerButton {...defaultProps} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Sample answer text")).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    const onClick = jest.fn();
    render(<AnswerButton {...defaultProps} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <AnswerButton {...defaultProps} onClick={onClick} disabled={true} />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("shows selected state styling", () => {
    render(<AnswerButton {...defaultProps} isSelected={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-blue-500");
    expect(button).toHaveClass("bg-blue-50");
  });

  it("shows correct answer feedback when submitted", () => {
    render(
      <AnswerButton {...defaultProps} isSubmitted={true} isCorrect={true} />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-green-500");
    expect(button).toHaveClass("bg-green-50");

    // Check for checkmark icon
    const checkIcon = button.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  it("shows incorrect answer feedback when submitted", () => {
    render(
      <AnswerButton
        {...defaultProps}
        isSubmitted={true}
        isSelected={true}
        isCorrect={false}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-red-500");
    expect(button).toHaveClass("bg-red-50");

    // Check for X icon
    const xIcon = button.querySelector("svg");
    expect(xIcon).toBeInTheDocument();
  });

  it("applies compact variant styling", () => {
    render(<AnswerButton {...defaultProps} variant="compact" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-3");
    expect(button).toHaveClass("min-h-[50px]");
  });

  it("applies large variant styling", () => {
    render(<AnswerButton {...defaultProps} variant="large" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-5");
    expect(button).toHaveClass("min-h-[70px]");
  });

  it("has proper accessibility attributes", () => {
    render(<AnswerButton {...defaultProps} isSelected={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute(
      "aria-label",
      "Option A: Sample answer text"
    );
    expect(button).toHaveAttribute("data-testid", "answer-button-A");
  });

  it("shows disabled state correctly", () => {
    render(<AnswerButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
    expect(button).toHaveClass("opacity-60");
  });

  it("shows feedback with showFeedback prop", () => {
    render(
      <AnswerButton {...defaultProps} showFeedback={true} isCorrect={true} />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border-green-500");

    const checkIcon = button.querySelector("svg");
    expect(checkIcon).toBeInTheDocument();
  });

  it("handles different letter values correctly", () => {
    const { rerender } = render(<AnswerButton {...defaultProps} letter="B" />);
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByTestId("answer-button-B")).toBeInTheDocument();

    rerender(<AnswerButton {...defaultProps} letter="D" />);
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByTestId("answer-button-D")).toBeInTheDocument();
  });

  it("handles empty text gracefully", () => {
    render(<AnswerButton {...defaultProps} text="" />);

    expect(screen.getByText("A")).toBeInTheDocument();
    // Text span should still be rendered even if empty
    const button = screen.getByRole("button");
    const textSpan = button.querySelector("span");
    expect(textSpan).toBeInTheDocument();
  });

  it("does not show animation when animateOnHover is false", () => {
    render(<AnswerButton {...defaultProps} animateOnHover={false} />);

    const button = screen.getByRole("button");
    expect(button).not.toHaveClass("transform");
    expect(button).not.toHaveClass("hover:scale-[1.01]");
  });

  it("shows animation by default", () => {
    render(<AnswerButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("transform");
    expect(button).toHaveClass("hover:scale-[1.01]");
  });

  it("handles complex text content", () => {
    const complexText =
      "The capital of France is Paris, which is located in northern France.";
    render(<AnswerButton {...defaultProps} text={complexText} />);

    expect(screen.getByText(complexText)).toBeInTheDocument();
  });

  it("maintains focus accessibility", () => {
    render(<AnswerButton {...defaultProps} />);

    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass("focus:ring-2");
    expect(button).toHaveClass("focus:ring-blue-500");
  });
});
