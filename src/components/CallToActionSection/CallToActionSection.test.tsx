import { fireEvent, render } from "@testing-library/react";
import CallToActionSection from "./CallToActionSection";

describe("CallToActionSection", () => {
  const setIsModalOpen = jest.fn();

  beforeEach(() => {
    setIsModalOpen.mockClear();
  });

  it("renders heading, description, and button", () => {
    const { getByText } = render(
      <CallToActionSection setIsModalOpen={setIsModalOpen} />
    );
    expect(getByText("Ready to Test Your Knowledge?")).toBeInTheDocument();
    expect(
      getByText(
        /Join thousands of players who are already challenging themselves/i
      )
    ).toBeInTheDocument();
    expect(getByText("Get Started Free")).toBeInTheDocument();
  });

  it("calls setIsModalOpen(true) when button is clicked", () => {
    const { getByText } = render(
      <CallToActionSection setIsModalOpen={setIsModalOpen} />
    );
    const button = getByText("Get Started Free");
    fireEvent.click(button);
    expect(setIsModalOpen).toHaveBeenCalledWith(true);
    expect(setIsModalOpen).toHaveBeenCalledTimes(1);
  });

  it("renders Star and Play icons", () => {
    const { container } = render(
      <CallToActionSection setIsModalOpen={setIsModalOpen} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });
});
