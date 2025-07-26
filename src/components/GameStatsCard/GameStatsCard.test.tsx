import React from "react";
import { render, screen } from "@testing-library/react";
import GameStatsCard from "./GameStatsCard";
import { features } from "./GameStatsCardData";

describe("GameStatsCard", () => {
  it("renders the card container", () => {
    render(<GameStatsCard />);
    expect(
      screen.getByRole("heading", { name: /game features/i })
    ).toBeInTheDocument();
  });

  it("renders all features from data", () => {
    render(<GameStatsCard />);
    features.forEach((feature) => {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.subtitle)).toBeInTheDocument();
    });
  });

  it("renders the correct number of feature cards", () => {
    render(<GameStatsCard />);
    const featureCards = screen.getAllByText((_, element) =>
      Boolean(element && element.className.includes("text-sm font-medium"))
    );
    expect(featureCards).toHaveLength(features.length);
  });

  it("renders feature icons", () => {
    render(<GameStatsCard />);
    features.forEach((feature) => {
      if (typeof feature.icon === "string") {
        expect(screen.getByText(feature.icon)).toBeInTheDocument();
      }
    });
  });
});
