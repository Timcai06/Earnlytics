# A/B Testing Guide

## Overview

The A/B testing framework allows you to run experiments to optimize user experience and conversion rates.

## Setup

### 1. Wrap your app with ABTestProvider

```tsx
import { ABTestingWrapper } from "@/lib/experiments";

export default function RootLayout({ children }) {
  return (
    <ABTestingWrapper>
      {children}
    </ABTestingWrapper>
  );
}
```

### 2. Create an Experiment

```tsx
const experiments: Experiment[] = [
  {
    id: "hero-cta-variant",
    name: "Hero CTA Button Variant",
    variants: [
      {
        id: "control",
        name: "Original",
        config: { buttonText: "开始探索", color: "blue" }
      },
      {
        id: "variant-a",
        name: "Variant A",
        config: { buttonText: "立即开始", color: "green" }
      }
    ],
    weights: [50, 50] // Traffic split
  }
];
```

### 3. Use in Components

```tsx
import { useABTest } from "@/lib/ab-testing";

function HeroSection() {
  const { variant, trackEvent } = useABTest("hero-cta-variant");
  
  if (!variant) return null;
  
  return (
    <button
      className={`btn-${variant.config.color}`}
      onClick={() => trackEvent("cta_clicked", { location: "hero" })}
    >
      {variant.config.buttonText}
    </button>
  );
}
```

## Tracking Events

### Automatic Events

- `experiment_assigned` - When user is assigned to a variant

### Manual Events

```tsx
const { trackEvent } = useABTest("experiment-id");

// Track conversions
trackEvent("signup_completed");

// Track with properties
trackEvent("chart_viewed", {
  chartType: "earnings",
  company: "AAPL"
});
```

## Current Experiments

### 1. Hero CTA Variant
- **ID**: `hero-cta-variant`
- **Hypothesis**: Different CTA text and color affects click-through rate
- **Variants**: Control (Blue), Variant A (Green), Variant B (Outlined)
- **Success Metric**: Click-through rate

### 2. Homepage Layout
- **ID**: `homepage-layout`
- **Hypothesis**: Minimal layout reduces distraction and improves engagement
- **Variants**: Control (Full), Minimal (Simplified)
- **Success Metric**: Time on page, scroll depth

### 3. Chart Color Scheme
- **ID**: `chart-color-scheme`
- **Hypothesis**: Color scheme affects data interpretation
- **Variants**: Control (Blue), Warm (Orange/Red)
- **Success Metric**: Chart interaction rate

## Analysis

### Google Analytics Integration

Events are automatically sent to Google Analytics if `gtag` is available:

```tsx
// In your analytics setup
window.gtag = function() {
  // Google Analytics implementation
};
```

### Manual Analysis

Export experiment data:

```bash
# Example: Query analytics database
SELECT 
  experiment_id,
  variant_id,
  event_name,
  COUNT(*) as count
FROM events
WHERE event_name IN ('experiment_assigned', 'signup_completed')
GROUP BY experiment_id, variant_id, event_name;
```

## Best Practices

1. **Run experiments for at least 2 weeks** to account for weekly patterns
2. **Minimum 100 conversions per variant** for statistical significance
3. **Test one variable at a time** to isolate effects
4. **Document learnings** from each experiment
5. **Roll out winners** to 100% of traffic

## Stopping Criteria

Stop an experiment when:
- Statistical significance reached (p < 0.05)
- Minimum 2 weeks of data collected
- Minimum 100 conversions per variant
- Clear winner identified (>10% improvement)

## Troubleshooting

### Variant not showing
- Check that experiment ID matches
- Verify ABTestProvider wraps the component
- Check localStorage for assigned variant

### Events not tracking
- Verify trackEvent is called
- Check browser console for errors
- Ensure Google Analytics is loaded
