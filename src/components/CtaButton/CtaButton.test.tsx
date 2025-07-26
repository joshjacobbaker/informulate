import { render } from "@testing-library/react";
import CtaButton from "./CtaButton";

describe("CtaButton", () => {
  it("calls onStartPlaying when 'Start Playing Now' button is clicked", () => {
    const onStartPlaying = jest.fn();
    const { getByText } = render(<CtaButton onStartPlaying={onStartPlaying} />);
    getByText("Start Playing Now").click();
    expect(onStartPlaying).toHaveBeenCalledTimes(1);
  });

  it("renders the start playing button", () => {
    const { getByText } = render(
      <CtaButton onStartPlaying={() => {}} />
    );
    expect(getByText("Start Playing Now")).toBeInTheDocument();
  });

  it("does not render a view demo button", () => {
    const { queryByText } = render(
      <CtaButton onStartPlaying={() => {}} />
    );
    expect(queryByText("View Demo")).not.toBeInTheDocument();
  });
});
