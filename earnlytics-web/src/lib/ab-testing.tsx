"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  weights?: number[];
}

export interface Variant {
  id: string;
  name: string;
  config: Record<string, unknown>;
}

interface ABTestContextType {
  getVariant: (experimentId: string) => Variant | null;
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void;
  experiments: Map<string, Variant>;
}

const ABTestContext = createContext<ABTestContextType | null>(null);

interface ABTestProviderProps {
  children: ReactNode;
  experiments: Experiment[];
}

function getRandomVariant(experiment: Experiment): Variant {
  const weights = experiment.weights || experiment.variants.map(() => 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < experiment.variants.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return experiment.variants[i];
    }
  }

  return experiment.variants[0];
}

function getStoredVariant(experimentId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`ab-test-${experimentId}`);
}

function storeVariant(experimentId: string, variantId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`ab-test-${experimentId}`, variantId);
}

export function ABTestProvider({ children, experiments }: ABTestProviderProps) {
  const [assignedVariants, setAssignedVariants] = useState<Map<string, Variant>>(new Map());

  useEffect(() => {
    const variants = new Map<string, Variant>();

    experiments.forEach((experiment) => {
      const storedVariantId = getStoredVariant(experiment.id);
      
      if (storedVariantId) {
        const variant = experiment.variants.find((v) => v.id === storedVariantId);
        if (variant) {
          variants.set(experiment.id, variant);
          return;
        }
      }

      const variant = getRandomVariant(experiment);
      storeVariant(experiment.id, variant.id);
      variants.set(experiment.id, variant);

      trackAssignment(experiment.id, variant.id);
    });

    setAssignedVariants(variants);
  }, [experiments]);

  const getVariant = (experimentId: string): Variant | null => {
    return assignedVariants.get(experimentId) || null;
  };

  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;

    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        url: window.location.href,
        experiments: Array.from(assignedVariants.entries()).map(([id, variant]) => ({
          experimentId: id,
          variantId: variant.id,
        })),
      },
    };

    console.log("[A/B Test Event]", eventData);

    if (window.gtag) {
      window.gtag("event", eventName, eventData.properties);
    }
  };

  const trackAssignment = (experimentId: string, variantId: string) => {
    trackEvent("experiment_assigned", {
      experimentId,
      variantId,
    });
  };

  return (
    <ABTestContext.Provider
      value={{
        getVariant,
        trackEvent,
        experiments: assignedVariants,
      }}
    >
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTest(experimentId: string) {
  const context = useContext(ABTestContext);
  
  if (!context) {
    throw new Error("useABTest must be used within ABTestProvider");
  }

  const variant = context.getVariant(experimentId);
  
  return {
    variant,
    trackEvent: context.trackEvent,
  };
}

export function useTrackEvent() {
  const context = useContext(ABTestContext);
  
  if (!context) {
    throw new Error("useTrackEvent must be used within ABTestProvider");
  }

  return context.trackEvent;
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
