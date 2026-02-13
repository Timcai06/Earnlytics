import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "使用条款 - Earnlytics",
  description: "使用 Earnlytics 服务的条款和条件",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold text-white">使用条款</h1>
      
      <div className="space-y-8 text-text-secondary">
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">1. 服务概述</h2>
          <p>
            Earnlytics 是一个提供科技公司财报分析和数据的平台。通过使用我们的服务，
            您同意遵守这些条款。我们保留随时修改这些条款的权利。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">2. 使用限制</h2>
          <p className="mb-4">用户同意不：</p>
          <ul className="list-inside list-disc space-y-2">
            <li>使用自动化工具（爬虫、机器人等）大规模抓取数据</li>
            <li>将我们的数据用于商业转售</li>
            <li>干扰或破坏服务的正常运行</li>
            <li>冒充其他用户或实体</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">3. 免责声明</h2>
          <p className="mb-4">
            Earnlytics 提供的所有信息和分析仅供参考，不构成投资建议。
            用户应自行判断并承担投资风险。
          </p>
          <p>
            我们不对数据的准确性、完整性或及时性作出任何明示或暗示的保证。
            投资者应参考官方财报和咨询专业顾问。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">4. 知识产权</h2>
          <p>
            网站上的所有内容（包括但不限于文字、图表、代码）均受版权保护。
            未经授权，禁止复制、修改或分发。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">5. 账户管理</h2>
          <p>
            用户有责任保护自己的账户信息安全。如发现账户被盗用，请立即联系我们。
            我们有权在不事先通知的情况下终止违反条款的账户。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">6. 责任限制</h2>
          <p>
            在法律允许的范围内，Earnlytics 不对任何直接、间接、偶然或后果性损害承担责任，
            包括但不限于利润损失、数据丢失或业务中断。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">7. 适用法律</h2>
          <p>
            这些条款受中华人民共和国法律管辖。任何争议应首先通过友好协商解决，
            协商不成的，提交中国国际经济贸易仲裁委员会仲裁。
          </p>
        </section>

        <section>
          <p className="text-sm">最后更新日期：2026年2月</p>
        </section>
      </div>
    </div>
  );
}
