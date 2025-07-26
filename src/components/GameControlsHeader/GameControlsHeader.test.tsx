import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GameControlsHeader from "./GameControlsHeader";

describe("GameControlsHeader", () => {
  const endGameMock = jest.fn();

  beforeEach(() => {
    endGameMock.mockClear();
  });

  it("renders the header title", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    expect(screen.getByText("AI Trivia Arena")).toBeInTheDocument();
  });

  it("renders the End Game button", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    expect(screen.getByText("End Game")).toBeInTheDocument();
  });

  it("calls endGame when End Game is clicked", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    fireEvent.click(screen.getByText("End Game"));
    expect(endGameMock).toHaveBeenCalled();
  });
});
