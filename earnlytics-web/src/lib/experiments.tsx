import { ABTestProvider as ABTestProviderComponent, Experiment } from "./ab-testing";

export const experimentsList: Experiment[] = [
  {
    id: "hero-cta-variant",
    name: "Hero CTA Button Variant",
    variants: [
      {
        id: "control",
        name: "Original Blue Button",
        config: {
          buttonText: "开始探索",
          buttonColor: "primary",
          showIcon: true,
        },
      },
      {
        id: "variant-a",
        name: "Green Button",
        config: {
          buttonText: "立即开始",
          buttonColor: "success",
          showIcon: false,
        },
      },
      {
        id: "variant-b",
        name: "Outlined Button",
        config: {
          buttonText: "免费试用",
          buttonColor: "outline",
          showIcon: true,
        },
      },
    ],
    weights: [50, 25, 25],
  },
  {
    id: "homepage-layout",
    name: "Homepage Layout Variant",
    variants: [
      {
        id: "control",
        name: "Original Layout",
        config: {
          showFeaturedCompanies: true,
          showStats: true,
          cardStyle: "default",
        },
      },
      {
        id: "minimal",
        name: "Minimal Layout",
        config: {
          showFeaturedCompanies: false,
          showStats: false,
          cardStyle: "minimal",
        },
      },
    ],
    weights: [50, 50],
  },
  {
    id: "chart-color-scheme",
    name: "Chart Color Scheme",
    variants: [
      {
        id: "control",
        name: "Blue Theme",
        config: {
          primaryColor: "#6366F1",
          secondaryColor: "#8B5CF6",
          successColor: "#10B981",
        },
      },
      {
        id: "warm",
        name: "Warm Theme",
        config: {
          primaryColor: "#F59E0B",
          secondaryColor: "#EF4444",
          successColor: "#10B981",
        },
      },
    ],
    weights: [50, 50],
  },
];

export function ABTestingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ABTestProviderComponent experiments={experimentsList}>{children}</ABTestProviderComponent>;
}
