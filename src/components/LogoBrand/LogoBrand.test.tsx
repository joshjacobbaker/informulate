import React from "react";
import { render, screen } from "@testing-library/react";
import LogoBrand from "./LogoBrand";

describe("LogoBrand", () => {
  it("renders the Brain icon", () => {
    render(<LogoBrand />);
    const brainIcon = screen.getByTestId("brain-icon");
    expect(brainIcon).toBeInTheDocument();
  });

  it("renders the brand name", () => {
    render(<LogoBrand />);
    expect(screen.getByText("AI Trivia Arena")).toBeInTheDocument();
  });

  it("has correct gradient classes", () => {
    render(<LogoBrand />);
    const gradientDiv = screen.getByText("AI Trivia Arena").parentElement;
    expect(gradientDiv).toHaveClass(
      "flex",
      "items-center",
      "justify-center",
      "mb-8"
    );
  });
});
