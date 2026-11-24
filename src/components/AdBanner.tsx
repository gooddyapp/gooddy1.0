import { useEffect, useState } from "react";
import { setBannerPaused, startBanner, stopBanner } from "@/lib/ads";

/** Reserves space only when a native Google banner is actually showing. */
export function AdBanner({ paused }: { paused: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    startBanner()
      .then((shown) => {
        if (alive) setVisible(shown);
      })
      .catch(() => {
        if (alive) setVisible(false);
      });
    return () => {
      alive = false;
      void stopBanner();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    void setBannerPaused(paused);
  }, [paused, visible]);

  if (!visible || paused) return null;
  return <div className="h-[50px] shrink-0" aria-hidden="true" />;
}
