import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 - Earnlytics",
  description: "了解 Earnlytics 如何保护您的隐私和数据安全",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold text-white">隐私政策</h1>
      
      <div className="space-y-8 text-[#A1A1AA]">
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">1. 信息收集</h2>
          <p className="mb-4">
            我们收集的信息包括您主动提供的信息以及自动收集的信息：
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>邮箱地址（用于订阅财报提醒）</li>
            <li>IP 地址（用于防止滥用和统计分析）</li>
            <li>浏览器类型和访问时间（用于改善用户体验）</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">2. 信息使用</h2>
          <p className="mb-4">我们使用收集的信息用于：</p>
          <ul className="list-inside list-disc space-y-2">
            <li>发送财报分析和提醒邮件</li>
            <li>改善网站功能和服务质量</li>
            <li>防止欺诈和滥用行为</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">3. 信息保护</h2>
          <p>
            我们采用行业标准的安全措施保护您的个人信息。所有数据传输均使用 SSL 加密，
            敏感信息存储在加密的数据库中。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">4. 第三方服务</h2>
          <p>
            我们使用第三方服务（如 Vercel、Supabase）来托管网站和存储数据。
            这些服务提供商都有自己的隐私政策，我们建议您查阅。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">5. Cookie 使用</h2>
          <p>
            我们使用 Cookie 来改善用户体验和分析网站流量。您可以在浏览器设置中禁用 Cookie，
            但这可能影响网站的某些功能。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">6. 联系我们</h2>
          <p>
            如果您对隐私政策有任何疑问，请通过以下方式联系我们：
            <br />
            邮箱：privacy@earnlytics.com
          </p>
        </section>

        <section>
          <p className="text-sm">最后更新日期：2026年2月</p>
        </section>
      </div>
    </div>
  );
}
