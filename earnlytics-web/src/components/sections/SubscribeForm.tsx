"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus("error")
      setMessage("请输入邮箱地址")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage(data.message)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "订阅失败")
      }
    } catch {
      setStatus("error")
      setMessage("网络错误，请稍后重试")
    }
  }

  return (
    <section className="bg-background px-6 py-16 md:px-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          订阅财报提醒
        </h2>
        <p className="mb-8 text-text-secondary">
          在财报发布后第一时间收到AI分析报告
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="输入你的邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="flex-1 bg-surface-secondary text-white placeholder:text-text-tertiary border-[#3F3F46] focus:border-[#6366F1] focus:ring-[#6366F1]"
          />
          <Button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-50"
          >
            {status === "loading" ? "订阅中..." : "订阅"}
          </Button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-4 text-xs text-text-tertiary">
          我们尊重你的隐私，随时可取消订阅
        </p>
      </div>
    </section>
  )
}
