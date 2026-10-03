"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/common/icons";

const PROGRAMS = [
  { href: "/qantas", label: "Qantas" },
  { href: "/alaska", label: "Atmos Rewards" },
] as const;

export const ProgramNav: React.FC<{ current: (typeof PROGRAMS)[number]["href"] }> = ({
  current,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const currentLabel = PROGRAMS.find((program) => program.href === current)?.label;

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav ref={containerRef} aria-label="Loyalty programs" className="relative text-sm">
      <button
        type="button"
        data-testid="program-nav-button"
        aria-expanded={open}
        aria-controls="program-nav-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
      >
        {currentLabel}
        <ChevronDownIcon className="w-4 h-4 text-slate-500" />
      </button>
      <ul
        id="program-nav-menu"
        hidden={!open}
        className="absolute right-0 z-20 mt-1 min-w-[160px] rounded-md border border-slate-200 bg-white py-1 shadow-md text-left"
      >
        {PROGRAMS.map((program) => (
          <li key={program.href}>
            <Link
              href={program.href}
              aria-current={program.href === current ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 transition-colors ${
                program.href === current
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {program.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
