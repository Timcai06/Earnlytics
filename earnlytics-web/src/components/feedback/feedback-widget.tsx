"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare, Star } from "lucide-react";

interface FeedbackWidgetProps {
  position?: "bottom-right" | "bottom-left";
}

export function FeedbackWidget({ position = "bottom-right" }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim() && rating === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
          rating,
          category,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setFeedback("");
          setRating(0);
          setCategory("");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionClasses = {
    "bottom-right": "right-4",
    "bottom-left": "left-4",
  };

  return (
    <div className={`fixed bottom-4 ${positionClasses[position]} z-50`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-[#6366F1] hover:bg-[#5558E0]"
          aria-label="Open feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-80 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {isSubmitted ? "感谢您的反馈!" : "发送反馈"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close feedback"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-slate-300">我们会认真阅读您的反馈</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">评分</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-colors ${
                        star <= rating ? "text-amber-400" : "text-slate-600"
                      }`}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">类别</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="">选择类别</option>
                  <option value="bug">问题反馈</option>
                  <option value="feature">功能建议</option>
                  <option value="improvement">改进意见</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">详细描述</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="请描述您遇到的问题或建议..."
                  className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!feedback.trim() && rating === 0)}
                className="w-full bg-[#6366F1] hover:bg-[#5558E0] disabled:opacity-50"
              >
                {isSubmitting ? "发送中..." : "发送反馈"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
