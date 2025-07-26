import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GameControlsHeader from "./GameControlsHeader";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("GameControlsHeader", () => {
  const pushMock = jest.fn();
  const endGameMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockClear();
    endGameMock.mockClear();
  });

  it("renders the header title", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    expect(screen.getByText("AI Trivia Arena")).toBeInTheDocument();
  });

  it("renders the View Demo and End Game buttons", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    expect(screen.getByText("View Demo")).toBeInTheDocument();
    expect(screen.getByText("End Game")).toBeInTheDocument();
  });

  it("calls router.push when View Demo is clicked", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    fireEvent.click(screen.getByText("View Demo"));
    expect(pushMock).toHaveBeenCalledWith("/scoreboard-demo");
  });

  it("calls endGame when End Game is clicked", () => {
    render(<GameControlsHeader endGame={endGameMock} />);
    fireEvent.click(screen.getByText("End Game"));
    expect(endGameMock).toHaveBeenCalled();
  });
});
