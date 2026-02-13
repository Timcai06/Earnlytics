"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NPSSurveyProps {
  delayInSeconds?: number;
}

export function NPSSurvey({ delayInSeconds = 30 }: NPSSurveyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const hasSeenSurvey = localStorage.getItem("nps-survey-seen");
    if (hasSeenSurvey) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayInSeconds * 1000);

    return () => clearTimeout(timer);
  }, [delayInSeconds]);

  const handleSubmit = async () => {
    if (score === null) return;

    try {
      await fetch("/api/nps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      localStorage.setItem("nps-survey-seen", "true");
      setIsSubmitted(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit NPS:", error);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("nps-survey-seen", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-96 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isSubmitted ? "感谢您的参与!" : "您向朋友推荐我们的可能性有多大?"}
            </h3>
            {!isSubmitted && (
              <p className="text-sm text-slate-400 mt-1">
                0 = 不可能，10 = 非常可能
              </p>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss survey"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <p className="text-slate-300">您的反馈对我们非常重要</p>
        ) : (
          <>
            <div className="flex justify-between gap-1 mb-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setScore(num)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    score === num
                      ? "bg-primary text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-label={`Score ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={score === null}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50"
            >
              提交
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
