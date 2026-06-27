"use client";

import { useEffect } from "react";

const TITLE = "Welcome Aboard";
// Larger radius + tighter arc → text fills the screen wide while the
// curved bend at the centre is clearly visible when facing the viewer.
const RADIUS = 580;
const ARC    = 90;   // total degrees of arc across the full title

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    // CSS fade-out starts at 4.0s, finishes at 4.6s — unmount after that
    const t = setTimeout(onDone, 4800);
    return () => clearTimeout(t);
  }, [onDone]);

  const chars = TITLE.split("");
  const n = chars.length;

  return (
    <div className="intro-scene" aria-hidden="true">
      {/* subtle grid overlay */}
      <div className="intro-grid" />

      <div className="intro-stage">
        {/* The cylinder: translates across screen + rotates */}
        <div className="intro-cylinder">
          {chars.map((ch, i) => {
            // spread characters across the arc; 0 = front of cylinder
            const angle = ((i / (n - 1)) - 0.5) * ARC;
            return (
              <span
                key={i}
                className="intro-char"
                style={{
                  // place on cylinder surface, then center each char
                  transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) translate(-50%, -50%)`,
                }}
              >
                {ch === " " ? " " : ch}
              </span>
            );
          })}
        </div>

        <p className="intro-tagline">Your trusted onboarding partner</p>
      </div>
    </div>
  );
}
