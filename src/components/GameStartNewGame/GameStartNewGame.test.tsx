import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GameStartNewGame from "./GameStartNewGame";
import { useRouter } from "next/navigation";
import { GameConfig } from "@/lib/stores/gameStore/gameStore";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("GameStartNewGame", () => {
  const pushMock = jest.fn();
  const mockOnConfigChange = jest.fn();
  
  const defaultGameConfig: GameConfig = {
    playerName: '',
    difficulty: 'medium',
    category: 'any',
    timePerQuestion: 60,
    enableExplanations: true,
    autoAdvance: false,
    autoAdvanceDelay: 3,
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockClear();
    mockOnConfigChange.mockClear();
  });

  it("renders the title and description", () => {
    render(
      <GameStartNewGame
        startNewGame={jest.fn()}
        createGameSession={{ isPending: false }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    expect(screen.getByText("AI Trivia Arena")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Test your knowledge with AI-generated questions and watch your score update in real-time!/i
      )
    ).toBeInTheDocument();
  });

  it("renders 'Start New Game' button when not pending", () => {
    render(
      <GameStartNewGame
        startNewGame={jest.fn()}
        createGameSession={{ isPending: false }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    const button = screen.getByRole("button", { name: /Start New Game/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("renders 'Starting Game...' button and disables it when pending", () => {
    render(
      <GameStartNewGame
        startNewGame={jest.fn()}
        createGameSession={{ isPending: true }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    const button = screen.getByRole("button", { name: /Starting Game.../i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("calls startNewGame when 'Start New Game' button is clicked", () => {
    const startNewGameMock = jest.fn();
    render(
      <GameStartNewGame
        startNewGame={startNewGameMock}
        createGameSession={{ isPending: false }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    const button = screen.getByRole("button", { name: /Start New Game/i });
    fireEvent.click(button);
    expect(startNewGameMock).toHaveBeenCalledTimes(1);
  });

  it("does not call startNewGame when button is disabled", () => {
    const startNewGameMock = jest.fn();
    render(
      <GameStartNewGame
        startNewGame={startNewGameMock}
        createGameSession={{ isPending: true }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    const button = screen.getByRole("button", { name: /Starting Game.../i });
    fireEvent.click(button);
    expect(startNewGameMock).not.toHaveBeenCalled();
  });

  it("navigates to home when 'Back to Home' button is clicked", () => {
    render(
      <GameStartNewGame
        startNewGame={jest.fn()}
        createGameSession={{ isPending: false }}
        gameConfig={defaultGameConfig}
        onConfigChange={mockOnConfigChange}
      />
    );
    const backButton = screen.getByRole("button", { name: /Back to Home/i });
    fireEvent.click(backButton);
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
