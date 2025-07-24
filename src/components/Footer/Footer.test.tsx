import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the footer element", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("displays the AI Trivia Arena title", () => {
    render(<Footer />);
    expect(screen.getByText("AI Trivia Arena")).toBeInTheDocument();
  });

  it("shows the powered by AI text", () => {
    render(<Footer />);
    expect(
      screen.getByText(
        /Powered by AI • Built with Next\.js • Real-time updates with Supabase/i
      )
    ).toBeInTheDocument();
  });

  it("shows the copyright", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2025 AI Trivia Arena. All rights reserved./i)
    ).toBeInTheDocument();
  });

  it("renders the Brain icon", () => {
    render(<Footer />);
    const brainIcon = screen.getByTestId("lucide-brain");
    expect(brainIcon).toBeInTheDocument();
  });
});
