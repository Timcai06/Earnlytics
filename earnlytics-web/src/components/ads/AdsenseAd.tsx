"use client";

import { useEffect, useRef, useState } from "react";

interface AdsenseAdProps {
  adSlot: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdsenseAd({ adSlot }: AdsenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasAdLoaded, setHasAdLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || hasAdLoaded || !adRef.current) return;

    const checkWidth = () => {
      if (!adRef.current) return false;
      const width = adRef.current.offsetWidth;
      return width > 0;
    };

    if (!checkWidth()) return;

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
        setHasAdLoaded(true);
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [isMounted, hasAdLoaded]);

  if (!isMounted) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle my-8 block mx-auto min-w-[300px]"
      style={{ display: "block" }}
      data-ad-client="ca-pub-4998656796758497"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      suppressHydrationWarning
    />
  );
}
