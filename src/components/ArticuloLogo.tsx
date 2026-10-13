"use client";

import React, { useEffect, useState } from "react";

interface ArticuloLogoProps {
  className?: string;
  variant?: "full" | "horizontal" | "icon" | "image";
  size?: "sm" | "md" | "lg";
  dark?: boolean;
  animateOnScroll?: boolean;
}

export function SoundwaveIcon({
  className = "h-8 w-auto",
  animateOnScroll = true,
}: {
  className?: string;
  animateOnScroll?: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);

  useEffect(() => {
    if (!animateOnScroll) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          setScrollY(y);
          setIsScrolled(y > 15);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [animateOnScroll]);

  // 7 soundwave bars matching the exact brand color sequence & height curve
  const bars = [
    { height: 16, y: 22, color: "#38A5AA", dur: "1.15s", delay: "0.0s" },  // 1: teal dot
    { height: 32, y: 14, color: "#33B0AA", dur: "0.95s", delay: "0.18s" }, // 2: teal medium
    { height: 48, y: 6, color: "#348EB3", dur: "1.25s", delay: "0.32s" },  // 3: cyan tall
    { height: 60, y: 0, color: "#3980BE", dur: "0.85s", delay: "0.45s" },  // 4: center blue tallest
    { height: 48, y: 6, color: "#DC8357", dur: "1.1s", delay: "0.22s" },   // 5: coral tall
    { height: 32, y: 14, color: "#FD903B", dur: "1.0s", delay: "0.12s" },  // 6: orange medium
    { height: 16, y: 22, color: "#FFA33E", dur: "1.2s", delay: "0.28s" },  // 7: amber dot
  ];

  // Calculate dynamic scroll-based scaling factor for each bar
  const getDynamicScale = (idx: number) => {
    if (!isScrolled) return 1;
    // Organic wave modulation based on scroll position + bar index
    const wave = Math.sin((scrollY * 0.04) + (idx * 0.85));
    return 0.75 + wave * 0.35; // scales smoothly between 0.4 and 1.1
  };

  return (
    <svg
      viewBox="0 0 112 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${isScrolled ? "soundwave-scrolled" : ""}`}
      aria-label="Articulo Soundwave"
    >
      <style>
        {`
          @keyframes soundwave-pulse {
            0%, 100% {
              transform: scaleY(1);
            }
            50% {
              transform: scaleY(0.42);
            }
          }
          .soundwave-bar {
            transform-box: fill-box;
            transform-origin: center;
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          .soundwave-scrolled .bar-0 {
            animation: soundwave-pulse 1.15s ease-in-out infinite 0.0s;
          }
          .soundwave-scrolled .bar-1 {
            animation: soundwave-pulse 0.95s ease-in-out infinite 0.18s;
          }
          .soundwave-scrolled .bar-2 {
            animation: soundwave-pulse 1.25s ease-in-out infinite 0.32s;
          }
          .soundwave-scrolled .bar-3 {
            animation: soundwave-pulse 0.85s ease-in-out infinite 0.45s;
          }
          .soundwave-scrolled .bar-4 {
            animation: soundwave-pulse 1.1s ease-in-out infinite 0.22s;
          }
          .soundwave-scrolled .bar-5 {
            animation: soundwave-pulse 1.0s ease-in-out infinite 0.12s;
          }
          .soundwave-scrolled .bar-6 {
            animation: soundwave-pulse 1.2s ease-in-out infinite 0.28s;
          }
        `}
      </style>
      {bars.map((bar, idx) => {
        const dynamicScale = getDynamicScale(idx);
        return (
          <rect
            key={idx}
            x={idx * 16}
            y={bar.y}
            width="8"
            height={bar.height}
            rx="4"
            fill={bar.color}
            className={`soundwave-bar bar-${idx}`}
            style={{
              transform: isScrolled ? `scaleY(${dynamicScale.toFixed(2)})` : "scaleY(1)",
            }}
          />
        );
      })}
    </svg>
  );
}

export default function ArticuloLogo({
  className = "",
  variant = "full",
  size = "md",
  dark = false,
  animateOnScroll = true,
}: ArticuloLogoProps) {
  const navyColor = dark ? "#FFFFFF" : "#0E2453";

  if (variant === "image") {
    const heightMap = { sm: 36, md: 52, lg: 76 };
    const h = heightMap[size];
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/logo-transparent.png"
          alt="articulo - SPEECH AND HEARING"
          style={{ height: `${h}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  if (variant === "icon") {
    const iconSize = { sm: "h-5 w-auto", md: "h-7 w-auto", lg: "h-10 w-auto" }[size];
    return <SoundwaveIcon className={`${iconSize} ${className}`} animateOnScroll={animateOnScroll} />;
  }

  if (variant === "horizontal") {
    const textSizes = {
      sm: { title: "text-lg", sub: "text-[9px]" },
      md: { title: "text-2xl", sub: "text-[11px]" },
      lg: { title: "text-3xl", sub: "text-xs" },
    }[size];

    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <SoundwaveIcon
          className={size === "sm" ? "h-6 w-auto" : size === "md" ? "h-8 w-auto" : "h-11 w-auto"}
          animateOnScroll={animateOnScroll}
        />
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight leading-none ${textSizes.title}`}
            style={{ color: navyColor, fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            articulo
          </span>
          <span
            className={`font-extrabold uppercase tracking-[0.25em] mt-1 ${textSizes.sub}`}
            style={{ color: dark ? "#94A3B8" : "#0E2453" }}
          >
            SPEECH AND HEARING
          </span>
        </div>
      </div>
    );
  }

  // Full stacked logo variant (soundwave on top, wordmark below, matching the uploaded brand guide)
  const scaleMap = {
    sm: { soundwave: "h-6 w-auto", wordmark: "text-2xl", sub: "text-[9px] tracking-[0.22em]" },
    md: { soundwave: "h-8 w-auto", wordmark: "text-3xl", sub: "text-[11px] tracking-[0.26em]" },
    lg: { soundwave: "h-12 w-auto", wordmark: "text-5xl", sub: "text-sm tracking-[0.3em]" },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <SoundwaveIcon className={`${scaleMap.soundwave} mb-1`} animateOnScroll={animateOnScroll} />
      <span
        className={`font-black tracking-tight leading-none ${scaleMap.wordmark}`}
        style={{ color: navyColor, fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        articulo
      </span>
      <span
        className={`font-extrabold uppercase mt-1.5 ${scaleMap.sub}`}
        style={{ color: dark ? "#94A3B8" : "#0E2453" }}
      >
        SPEECH AND HEARING
      </span>
    </div>
  );
}
