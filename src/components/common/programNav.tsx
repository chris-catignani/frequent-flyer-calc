import React from "react";
import Link from "next/link";

const PROGRAMS = [
  { href: "/qantas", label: "Qantas" },
  { href: "/alaska", label: "Atmos Rewards" },
] as const;

export const ProgramNav: React.FC<{ current: (typeof PROGRAMS)[number]["href"] }> = ({
  current,
}) => {
  return (
    <nav aria-label="Loyalty programs" className="flex justify-center gap-1 mb-2 text-sm">
      {PROGRAMS.map((program) => (
        <Link
          key={program.href}
          href={program.href}
          aria-current={program.href === current ? "page" : undefined}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            program.href === current
              ? "bg-slate-100 text-slate-900 font-medium"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {program.label}
        </Link>
      ))}
    </nav>
  );
};
