"use client";

import { useState, useEffect } from "react";

export default function useSearchState(initialArea = "") {
  const [area, setArea] = useState(initialArea);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let lastScroll = 0;

    const handle = () => {
      const y = window.scrollY;

      // After hero height → compact mode
      if (y > 160 && y > lastScroll) setIsCompact(true);

      // When scrolling upward → smooth back to big mode
      if (y < 80 && y < lastScroll) setIsCompact(false);

      lastScroll = y;
    };

    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return { area, setArea, isCompact };
}
