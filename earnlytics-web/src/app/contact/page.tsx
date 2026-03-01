import type { Metadata } from "next";
import AdsenseAd from "@/components/ads/AdsenseAd";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "联系我们 - Earnlytics",
  description: "联系我们获取支持或商务合作",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold text-white">联系我们</h1>
      
      <div className="space-y-8 text-text-secondary">
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">1. 商务合作</h2>
          <p className="mb-4">
            对于商务合作、投资或API集成需求，请发送邮件至：
          </p>
          <p className="text-lg font-medium text-primary">
            business@earnlytics.com
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">2. 技术支持</h2>
          <p className="mb-4">
            如果您在使用过程中遇到任何技术问题，请发送邮件至：
          </p>
          <p className="text-lg font-medium text-primary">
            support@earnlytics.com
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">3. 隐私相关</h2>
          <p className="mb-4">
            如有隐私政策相关问题，请联系：
          </p>
          <p className="text-lg font-medium text-primary">
            privacy@earnlytics.com
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">4. 响应时间</h2>
          <p>
            我们通常会在 1-3 个工作日内回复您的邮件。
            如有紧急事项，请在邮件标题中注明「紧急」。
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-white">5. 其他方式</h2>
          <p className="mb-4">
            您也可以通过以下方式关注我们：
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>GitHub: github.com/Timcai06/Earnlytics</li>
            <li>产品官网: {siteUrl}</li>
          </ul>
        </section>

        <section>
          <p className="text-sm">最后更新日期：2026年2月</p>
        </section>
      </div>

      <AdsenseAd adSlot="8940210543" />
    </div>
  );
}
