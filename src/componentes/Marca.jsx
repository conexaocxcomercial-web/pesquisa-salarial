import React from "react";
import { LOGOS } from "@/data/logos";

/* Logos da marca como máscara, recoloridos por CSS. */
export function Logo({ logo, altura, cor, rotulo, className = "" }) {
  const url = `url(${logo.src})`;
  return (
    <span role={rotulo ? "img" : undefined} aria-label={rotulo || undefined} aria-hidden={rotulo ? undefined : "true"} className={`inline-block shrink-0 ${className}`} style={{
      width: (logo.w / logo.h) * altura, height: altura, backgroundColor: cor,
      WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "contain", maskSize: "contain",
      WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "left center", maskPosition: "left center",
    }} />
  );
}
export { LOGOS };
