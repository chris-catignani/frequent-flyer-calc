import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-12 mb-6 px-4 flex flex-col items-center text-center gap-2 text-xs sm:text-sm text-slate-500">
      <p>
        Calculations based on{" "}
        <a
          href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-800"
        >
          Qantas/Jetstar
        </a>{" "}
        and{" "}
        <a
          href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-800"
        >
          Partner
        </a>{" "}
        earning tables as of March 2026.
      </p>
      <p>
        This website is an independent community tool and is not affiliated with, sponsored by, or
        endorsed by Qantas Airways, Jetstar Airways, or any partner airlines.
      </p>
      <p className="inline-flex items-center justify-center flex-wrap gap-1">
        Made with <span className="sr-only">love</span>
        <svg
          aria-hidden="true"
          focusable="false"
          className="inline-block w-4 h-4 text-red-500 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>{" "}
        from{" "}
        <a
          href="https://www.flyertalk.com/forum/members/delighted5153.html"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-800"
        >
          delighted5153
        </a>{" "}
        (Feedback welcome!)
      </p>
    </footer>
  );
};
