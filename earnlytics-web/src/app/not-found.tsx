import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#FAFAFA] px-4 py-20 text-center">
      <div className="relative mb-8">
        <h1 className="text-[160px] font-bold leading-none text-border opacity-50">
          404
        </h1>
      </div>

      <h2 className="mb-4 text-[36px] font-bold text-slate-900">
        页面未找到
      </h2>

      <p className="mb-8 max-w-md text-lg text-slate-500">
        抱歉，您访问的页面不存在或已被移除
      </p>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          返回首页
        </Link>
        <Link
          href="/companies"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          浏览公司目录
        </Link>
      </div>

      <div className="mt-12 flex items-end gap-2">
        <div className="h-16 w-1 rounded-full bg-border" />
        <div className="h-24 w-1 rounded-full bg-border" />
        <div className="h-20 w-1 rounded-full bg-border" />
        <div className="h-28 w-1 rounded-full bg-primary" />
        <div className="h-12 w-1 rounded-full bg-border" />
      </div>
    </div>
  );
}
