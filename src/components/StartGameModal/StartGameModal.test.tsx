import { fireEvent, render } from "@testing-library/react";
import StartGameModal from "./StartGameModal";

describe("StartGameModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onStartGame: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when isOpen is true", () => {
    const { getByText } = render(<StartGameModal {...defaultProps} />);
    expect(getByText("Start New Game")).toBeInTheDocument();
    expect(getByText("Difficulty Level")).toBeInTheDocument();
    expect(getByText("Category")).toBeInTheDocument();
    expect(getByText("Start Game")).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    const { queryByText } = render(
      <StartGameModal {...defaultProps} isOpen={false} />
    );
    expect(queryByText("Start New Game")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const { getByTestId } = render(<StartGameModal {...defaultProps} />);
    const closeBtn = getByTestId("start-game-modal-close");
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("submits with default values and calls onStartGame", () => {
    const { getByText } = render(<StartGameModal {...defaultProps} />);
    fireEvent.click(getByText("Start Game"));
    expect(defaultProps.onStartGame).toHaveBeenCalledWith(
      "Anonymous Player",
      "medium",
      ""
    );
  });

  it("submits with entered player name, selected difficulty and category", () => {
    const { getByLabelText, getByText } = render(
      <StartGameModal {...defaultProps} />
    );
    fireEvent.change(getByLabelText(/Player Name/i), {
      target: { value: "Alice" },
    });
    fireEvent.click(getByLabelText(/Hard/i));
    fireEvent.change(getByLabelText(/Category/i), {
      target: { value: "Science & Nature" },
    });
    fireEvent.click(getByText("Start Game"));
    expect(defaultProps.onStartGame).toHaveBeenCalledWith(
      "Alice",
      "hard",
      "Science & Nature"
    );
  });

  it("shows all difficulty options", () => {
    const { getByLabelText } = render(<StartGameModal {...defaultProps} />);
    expect(getByLabelText(/Easy/i)).toBeInTheDocument();
    expect(getByLabelText(/Medium/i)).toBeInTheDocument();
    expect(getByLabelText(/Hard/i)).toBeInTheDocument();
  });

  it("shows all category options", () => {
    const { getByLabelText } = render(<StartGameModal {...defaultProps} />);
    const select = getByLabelText(/Category/i);
    expect(select).toHaveTextContent("Any Category");
    expect(select).toHaveTextContent("Science & Nature");
    expect(select).toHaveTextContent("History");
    expect(select).toHaveTextContent("Geography");
    expect(select).toHaveTextContent("Sports");
    expect(select).toHaveTextContent("Entertainment");
    expect(select).toHaveTextContent("Technology");
    expect(select).toHaveTextContent("Literature");
    expect(select).toHaveTextContent("Art & Culture");
  });
});
