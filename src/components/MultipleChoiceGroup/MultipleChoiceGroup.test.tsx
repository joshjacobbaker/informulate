import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MultipleChoiceGroup, {
  MultipleChoiceOption,
} from "./MultipleChoiceGroup";

const mockOptions: MultipleChoiceOption[] = [
  { letter: "A", text: "Paris", isCorrect: true },
  { letter: "B", text: "London", isCorrect: false },
  { letter: "C", text: "Berlin", isCorrect: false },
  { letter: "D", text: "Madrid", isCorrect: false },
];

describe("MultipleChoiceGroup", () => {
  const defaultProps = {
    options: mockOptions,
    onAnswerSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all options correctly", () => {
    render(<MultipleChoiceGroup {...defaultProps} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("calls onAnswerSelect when an option is clicked", () => {
    const onAnswerSelect = jest.fn();
    render(
      <MultipleChoiceGroup {...defaultProps} onAnswerSelect={onAnswerSelect} />
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(onAnswerSelect).toHaveBeenCalledWith("A");
  });

  it("shows selected answer correctly", () => {
    render(<MultipleChoiceGroup {...defaultProps} selectedAnswer="B" />);

    const londonButton = screen.getByText("London").closest("button");
    expect(londonButton).toHaveClass("border-blue-500");
  });

  it("shows correct answers when feedback is enabled", () => {
    render(
      <MultipleChoiceGroup
        {...defaultProps}
        showFeedback={true}
        correctAnswer="A"
      />
    );

    const parisButton = screen.getByText("Paris").closest("button");
    expect(parisButton).toHaveClass("border-green-500");
  });

  it("does not call onAnswerSelect when disabled", () => {
    const onAnswerSelect = jest.fn();
    render(
      <MultipleChoiceGroup
        {...defaultProps}
        onAnswerSelect={onAnswerSelect}
        disabled={true}
      />
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(onAnswerSelect).not.toHaveBeenCalled();
  });

  it("does not call onAnswerSelect when submitted", () => {
    const onAnswerSelect = jest.fn();
    render(
      <MultipleChoiceGroup
        {...defaultProps}
        onAnswerSelect={onAnswerSelect}
        isSubmitted={true}
      />
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(onAnswerSelect).not.toHaveBeenCalled();
  });

  it("applies grid layout correctly", () => {
    const { container } = render(
      <MultipleChoiceGroup {...defaultProps} layout="grid" />
    );

    const groupDiv = container.firstChild;
    expect(groupDiv).toHaveClass("grid");
    expect(groupDiv).toHaveClass("grid-cols-1");
    expect(groupDiv).toHaveClass("md:grid-cols-2");
  });

  it("applies horizontal layout correctly", () => {
    const { container } = render(
      <MultipleChoiceGroup {...defaultProps} layout="horizontal" />
    );

    const groupDiv = container.firstChild;
    expect(groupDiv).toHaveClass("flex");
    expect(groupDiv).toHaveClass("flex-wrap");
  });

  it("applies vertical layout by default", () => {
    const { container } = render(<MultipleChoiceGroup {...defaultProps} />);

    const groupDiv = container.firstChild;
    expect(groupDiv).toHaveClass("space-y-3");
  });

  it("passes variant prop to AnswerButton components", () => {
    render(<MultipleChoiceGroup {...defaultProps} variant="compact" />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass("p-3"); // compact variant styling
    });
  });

  it("has proper accessibility attributes", () => {
    render(<MultipleChoiceGroup {...defaultProps} />);

    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("aria-label", "Multiple choice answers");
  });

  it("handles empty options array", () => {
    render(<MultipleChoiceGroup {...defaultProps} options={[]} />);

    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("shows feedback for incorrect selected answer", () => {
    render(
      <MultipleChoiceGroup
        {...defaultProps}
        selectedAnswer="B"
        isSubmitted={true}
        correctAnswer="A"
      />
    );

    // Correct answer should be green
    const parisButton = screen.getByText("Paris").closest("button");
    expect(parisButton).toHaveClass("border-green-500");

    // Selected incorrect answer should be red
    const londonButton = screen.getByText("London").closest("button");
    expect(londonButton).toHaveClass("border-red-500");
  });

  it("uses isCorrect property from options when correctAnswer is not provided", () => {
    render(<MultipleChoiceGroup {...defaultProps} showFeedback={true} />);

    const parisButton = screen.getByText("Paris").closest("button");
    expect(parisButton).toHaveClass("border-green-500");
  });

  it("prefers correctAnswer prop over isCorrect property", () => {
    const optionsWithWrongCorrect = [
      { letter: "A", text: "Paris", isCorrect: false },
      { letter: "B", text: "London", isCorrect: true }, // Wrong in options
    ];

    render(
      <MultipleChoiceGroup
        options={optionsWithWrongCorrect}
        onAnswerSelect={jest.fn()}
        showFeedback={true}
        correctAnswer="A" // Correct answer via prop
      />
    );

    const parisButton = screen.getByText("Paris").closest("button");
    expect(parisButton).toHaveClass("border-green-500");

    const londonButton = screen.getByText("London").closest("button");
    expect(londonButton).not.toHaveClass("border-green-500");
  });
});
