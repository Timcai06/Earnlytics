import Link from "next/link";

export default function AboutPage() {
  const missions = [
    {
      icon: "AI",
      title: "AI 驱动",
      description: "利用人工智能技术，快速分析海量财报数据，提取关键洞察",
      border: "border-primary",
      shadow: "shadow-[0_0_20px_rgba(99,102,241,0.13)]",
      iconBg: "bg-primary-light",
      iconColor: "text-primary",
    },
    {
      icon: "中",
      title: "中文友好",
      description: "为中国投资者提供母语财报解读，消除语言障碍",
      border: "border-success",
      shadow: "shadow-[0_0_20px_rgba(34,197,94,0.13)]",
      iconBg: "bg-success-light",
      iconColor: "text-success",
    },
    {
      icon: "¥",
      title: "完全免费",
      description: "基础功能永久免费，降低投资信息获取门槛",
      border: "border-info",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.13)]",
      iconBg: "bg-info-light",
      iconColor: "text-info",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* About Hero */}
      <section className="bg-background px-20 py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-2xl bg-primary-light px-4 py-2">
            <span className="text-sm font-semibold text-primary-hover">关于我们</span>
          </div>
          <h1 className="mb-6 text-[56px] font-bold text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            关于 Earnlytics
          </h1>
          <p className="mb-8 text-2xl text-text-secondary">让财报分析变得简单易懂</p>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary">
            Earnlytics 是一个专注于美国科技公司财报分析的平台。
            我们利用人工智能技术，为中国投资者提供快速、准确、易懂的财报解读服务。
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-surface px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-[40px] font-bold text-white">
            我们的使命
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {missions.map((mission) => (
              <div
                key={mission.title}
                className={`rounded-2xl border ${mission.border} bg-surface-secondary p-8 ${mission.shadow}`}
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-xl ${mission.iconBg}`}>
                  <span className={`text-2xl font-bold ${mission.iconColor}`}>
                    {mission.icon}
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">{mission.title}</h3>
                <p className="text-base leading-relaxed text-text-secondary">
                  {mission.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-surface px-20 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-[40px] font-bold text-white">
            联系我们
          </h2>

          <div className="grid grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h3 className="mb-8 text-2xl font-bold text-white">联系方式</h3>
              <div>
                <p className="mb-2 text-sm font-medium text-text-secondary">邮箱</p>
                <Link
                  href="mailto:contact@earnlytics.com"
                  className="text-lg text-primary hover:underline"
                >
                  contact@earnlytics.com
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-primary bg-surface-secondary p-8 shadow-[0_0_30px_rgba(99,102,241,0.19)]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    姓名
                  </label>
                  <input
                    type="text"
                    className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    邮箱
                  </label>
                  <input
                    type="email"
                    className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    留言
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-white"
                  />
                </div>
                <button className="h-12 w-full rounded-lg bg-primary text-base font-semibold text-white shadow-[0_4px_20px_rgba(99,102,241,0.6)] transition-colors hover:bg-primary-hover">
                  发送留言
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
