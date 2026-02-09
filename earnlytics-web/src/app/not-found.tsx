import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Not Found Content */}
      <section className="flex flex-1 flex-col items-center justify-center bg-background px-20 py-20">
        {/* Large 404 */}
        <span className="mb-4 text-[160px] font-bold leading-none text-[#27272A] opacity-50">
          404
        </span>

        <h1 className="mb-4 text-4xl font-bold text-white">页面未找到</h1>
        <p className="mb-8 text-lg text-[#A1A1AA]">
          抱歉，您访问的页面不存在或已被移除
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            返回首页
          </Link>
          <Link
            href="/companies"
            className="rounded-lg border border-[#6366F1] bg-[rgba(99,102,241,0.15)] px-8 py-3.5 text-base font-medium text-[#E0E7FF] shadow-[0_0_15px_rgba(99,102,241,0.19)] transition-colors hover:bg-[rgba(99,102,241,0.25)]"
          >
            浏览公司目录
          </Link>
        </div>

        {/* Decoration */}
        <div className="mt-16 h-24 w-48">
          <svg viewBox="0 0 200 100" className="h-full w-full">
            <path
              d="M0,50 Q50,10 100,50 T200,50"
              fill="none"
              stroke="#27272A"
              strokeWidth="3"
            />
            <circle cx="100" cy="50" r="6" fill="#6366F1" />
          </svg>
        </div>
      </section>
    </div>
  );
}
