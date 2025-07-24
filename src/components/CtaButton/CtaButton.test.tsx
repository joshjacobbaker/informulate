import { render } from "@testing-library/react";
import CtaButton from "./CtaButton";

describe("CtaButton", () => {
  it("calls onStartPlaying when 'Start Playing Now' button is clicked", () => {
    const onStartPlaying = jest.fn();
    const { getByText } = render(<CtaButton onStartPlaying={onStartPlaying} />);
    getByText("Start Playing Now").click();
    expect(onStartPlaying).toHaveBeenCalledTimes(1);
  });

  it("calls onViewDemo when 'View Demo' button is clicked", () => {
    const onStartPlaying = jest.fn();
    const onViewDemo = jest.fn();
    const { getByText } = render(
      <CtaButton onStartPlaying={onStartPlaying} onViewDemo={onViewDemo} />
    );
    getByText("View Demo").click();
    expect(onViewDemo).toHaveBeenCalledTimes(1);
  });

  it("does not throw if onViewDemo is not provided and 'View Demo' is clicked", () => {
    const onStartPlaying = jest.fn();
    const { getByText } = render(<CtaButton onStartPlaying={onStartPlaying} />);
    expect(() => getByText("View Demo").click()).not.toThrow();
  });

  it("renders both buttons", () => {
    const { getByText } = render(
      <CtaButton onStartPlaying={() => {}} onViewDemo={() => {}} />
    );
    expect(getByText("Start Playing Now")).toBeInTheDocument();
    expect(getByText("View Demo")).toBeInTheDocument();
  });
});
