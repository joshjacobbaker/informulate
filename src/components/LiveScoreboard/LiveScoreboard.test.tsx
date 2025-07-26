/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import LiveScoreboard from "./LiveScoreboard";

// Mock the hooks
jest.mock("@/lib/query", () => ({
  useScoreRealtime: jest.fn(),
  useScoreNotifications: jest.fn(),
}));

const useScoreRealtime = require("@/lib/query").useScoreRealtime as jest.MockedFunction<any>;
const useScoreNotifications = require("@/lib/query").useScoreNotifications as jest.MockedFunction<any>;

/**
 * LiveScoreboard Component Tests
 */

describe("LiveScoreboard Component", () => {
  it("should be tested once Jest ES module compatibility is resolved", () => {
    expect(true).toBe(true);
  });
});
// Mock icons to avoid SVG issues
jest.mock("lucide-react", () => ({
  Trophy: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-trophy" />,
  Target: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-target" />,
  Zap: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-zap" />,
  TrendingUp: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-trendingup" />,
  User: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-user" />,
  Calendar: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-calendar" />,
  Plus: (props: Record<string, unknown>) => <svg {...props} data-testid="icon-plus" />,
}));

// Mock hooks
jest.mock("@/lib/query", () => ({
  useScoreRealtime: jest.fn(),
  useScoreNotifications: jest.fn(),
}));

const mockLiveScoreData = {
  score: 1234,
  correctAnswers: 10,
  totalAnswers: 15,
  currentStreak: 3,
  maxStreak: 5,
  accuracy: 66.7,
  isActive: true,
  lastUpdate: null,
  animations: {
    showScoreIncrease: false,
    scoreIncrease: 0,
    showAchievement: false,
    achievement: null,
  },
};

const mockLiveScoreDataWithAnimations = {
  ...mockLiveScoreData,
  animations: {
    showScoreIncrease: true,
    scoreIncrease: 50,
    showAchievement: true,
    achievement: {
      type: "streak",
      message: "3 in a row!",
    },
  },
};

// Helper to create complete mock return values
const createMockScoreRealtime = (overrides: any = {}) => ({
  liveScoreData: null,
  isConnected: false,
  connectionStatus: "disconnected" as const,
  clearAnimations: jest.fn(),
  ...overrides,
});

const createMockScoreNotifications = (overrides: any = {}) => ({
  latestUpdate: null,
  hasUpdate: false,
  clearUpdate: jest.fn(),
  ...overrides,
});

describe("LiveScoreboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    useScoreRealtime.mockReturnValue(createMockScoreRealtime());
    useScoreNotifications.mockReturnValue(createMockScoreNotifications());

    render(<LiveScoreboard sessionId="session123" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders no data message if liveScoreData is null after loading", async () => {
    useScoreRealtime.mockReturnValue(createMockScoreRealtime());
    useScoreNotifications.mockReturnValue(createMockScoreNotifications());

    render(<LiveScoreboard sessionId="session123" />);
    
    // Wait for the loading to finish and no data message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/No game session data available/i)
      ).toBeInTheDocument();
    });
  });

  it("renders compact scoreboard with correct values", async () => {
    useScoreRealtime.mockReturnValue(createMockScoreRealtime({
      liveScoreData: mockLiveScoreData,
      isConnected: true,
    }));
    useScoreNotifications.mockReturnValue(createMockScoreNotifications());

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" compact />);
    });

    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("10/15")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Live/i)).toBeInTheDocument();
  });

  it("renders full scoreboard with stats and progress bar", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: mockLiveScoreData,
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="sessionABCDEF" />);
    });

    expect(screen.getByText(/Live Scoreboard/i)).toBeInTheDocument();
    expect(screen.getByText("Total Score")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("10/15")).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getAllByText("66.7%")).toHaveLength(2); // Appears in accuracy stat and progress bar
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Best Streak")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/Player/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Performance/i)).toBeInTheDocument();
  });

  it("shows offline status when isConnected is false", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: mockLiveScoreData,
      isConnected: false,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
  });

  it("shows global score update notification when hasUpdate is true", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: mockLiveScoreData,
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: { isCorrect: true, pointsEarned: 20 },
      hasUpdate: true,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
    expect(screen.getByText(/\+20 points/i)).toBeInTheDocument();
  });

  it("shows score increase animation when showScoreIncrease is true", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: mockLiveScoreDataWithAnimations,
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText("+50")).toBeInTheDocument();
  });

  it("shows achievement notification when showAchievement is true", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: mockLiveScoreDataWithAnimations,
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText(/Achievement Unlocked!/i)).toBeInTheDocument();
    expect(screen.getByText(/3 in a row!/i)).toBeInTheDocument();
  });

  it("shows streak animation when currentStreak > 2", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: { ...mockLiveScoreData, currentStreak: 4 },
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText(/On Fire!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/4 correct answers in a row!/i)
    ).toBeInTheDocument();
  });

  it("shows 'Ended' status when isActive is false", async () => {
    useScoreRealtime.mockReturnValue({
      liveScoreData: { ...mockLiveScoreData, isActive: false },
      isConnected: true,
    });
    useScoreNotifications.mockReturnValue({
      latestUpdate: null,
      hasUpdate: false,
    });

    await act(async () => {
      render(<LiveScoreboard sessionId="session123" />);
    });

    expect(screen.getByText("Ended")).toBeInTheDocument();
  });
});
