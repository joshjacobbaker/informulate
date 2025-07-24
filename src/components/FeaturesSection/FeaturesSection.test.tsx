import { render } from "@testing-library/react";
import FeaturesSection from "./FeaturesSection";
import { featuresData } from "./featuresSectionData";

const featuresDataMock = [
  {
    title: "Fast Performance",
    description:
      "Experience lightning-fast response times for all your trivia needs.",
  },
  {
    title: "Smart Questions",
    description:
      "Questions are generated using advanced AI algorithms for maximum engagement.",
  },
  {
    title: "User Friendly",
    description: "Intuitive design makes it easy for anyone to play and enjoy.",
  },
];
describe("FeaturesSection", () => {
  it("renders section and heading", () => {
    const { getByText } = render(<FeaturesSection features={featuresData} />);
    expect(getByText("Why Choose AI Trivia Arena?")).toBeInTheDocument();
    expect(
      getByText(
        /Built with cutting-edge technology to deliver the most engaging and intelligent trivia experience./
      )
    ).toBeInTheDocument();
  });

  it("renders all features", () => {
    const { getByText } = render(<FeaturesSection features={featuresData} />);
    featuresData.forEach((feature) => {
      expect(getByText(feature.title)).toBeInTheDocument();
      expect(getByText(feature.description)).toBeInTheDocument();
    });
  });

  it("does not render icon if not provided", () => {
    const { container } = render(
      <FeaturesSection features={featuresDataMock} />
    );
    const featureCards = container.querySelectorAll(".bg-white");
    expect(featureCards[1].querySelector("svg")).toBeNull();
  });
});
