"use client";

import { ArrowRight } from "lucide-react";
import FlipCard from "@/components/ui/FlipCard";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import AccordionFAQ from "@/components/ui/AccordionFAQ";
import GlowingButton from "@/components/ui/GlowingButton";
import AnalysisPreview from "@/components/ui/AnalysisPreview";

interface FaqItem {
  q: string;
  a: string;
}

interface CompanyCardData {
  price: string;
  change: string;
  sentiment: string;
  eps: string;
  rev: string;
}

interface CompanyShowcaseItem {
  icon: React.ReactNode;
  name: string;
  border: string;
  data: CompanyCardData;
}

interface LandingDeferredSectionsProps {
  companies: CompanyShowcaseItem[];
  faqs: FaqItem[];
}

export default function LandingDeferredSections({ companies, faqs }: LandingDeferredSectionsProps) {
  return (
    <>
      <section id="preview" className="relative h-[calc(100vh-87px)] snap-start flex flex-col items-center justify-center overflow-hidden bg-background">
        <AnalysisPreview />
        <ScrollIndicator targetId="companies" />
      </section>

      <section id="companies" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-success/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              覆盖热门科技公司
            </h2>
            <div className="h-1.5 w-20 rounded-full bg-primary" />
          </div>
          <p className="mb-12 max-w-2xl text-xl text-text-secondary">
            追踪 Apple、Microsoft、NVIDIA 等 30+ 家科技巨头的财报动态
          </p>

          <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {companies.map((company) => (
              <FlipCard
                key={company.name}
                width="140px"
                height="140px"
                className="mx-auto"
                front={
                  <div className={`flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border ${company.border} bg-surface-secondary shadow-lg`}>
                    {company.icon}
                    <span className="font-semibold text-white">{company.name}</span>
                  </div>
                }
                back={
                  <div className={`flex h-full w-full flex-col items-center justify-between rounded-2xl border ${company.border} bg-surface-elevated p-4 shadow-xl`}>
                    <div className="text-center">
                      <div className="text-xs text-text-secondary">EPS / Revenue</div>
                      <div className="font-mono text-sm font-bold text-white">{company.data.eps} / {company.data.rev}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-text-secondary">AI 情绪</span>
                      <span className="text-sm font-bold text-white">{company.data.sentiment}</span>
                    </div>
                  </div>
                }
              />
            ))}
          </div>

          <GlowingButton href="/companies">
            查看全部 30+ 家公司
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </GlowingButton>
        </div>
        <ScrollIndicator targetId="faq" />
      </section>

      <section id="faq" className="relative flex h-[calc(100vh-87px)] snap-start flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-info/10 blur-[100px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h2 className="mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              常见问题
            </h2>
            <p className="mb-8 text-xl text-text-secondary leading-relaxed">
              关于 Earnlytics，您可能想了解这些。如果没有找到您需要的答案，欢迎随时联系我们的支持团队。
            </p>

            <div className="flex items-center gap-4 text-primary font-medium group cursor-pointer">
              <span className="border-b border-primary/20 pb-1 group-hover:border-primary transition-all">
                联系技术支持
              </span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div className="lg:col-span-7 flex items-center">
            <AccordionFAQ items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
