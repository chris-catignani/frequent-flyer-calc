import React from "react";
import { CHOOSE_HOW_YOU_EARN_URL, PARTNER_EARN_CHART_URL } from "@/calculators/atmos/constants";

export const AtmosInfo: React.FC = () => {
  return (
    <section className="w-full max-w-2xl mt-10 flex flex-col gap-3 text-sm text-slate-700">
      <h2 className="text-lg font-medium text-slate-900">How Atmos Rewards earning works</h2>
      <p>
        Atmos Rewards members choose to earn by distance traveled, price paid, or segments flown.
        Elite members earn bonus Atmos Points (Silver 25%, Gold 50%, Platinum 100%, Titanium 150%);
        status points are not boosted by status.
      </p>
      <h3 className="font-medium text-slate-900">Assumptions this calculator makes</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Elite bonuses on partner-chart flights are calculated on the base points column.</li>
        <li>Price-paid ticket totals are split across flights in proportion to distance.</li>
        <li>
          Guam, Puerto Rico and other US territories count as the United States for Global Locals.
        </li>
        <li>
          The Huakaʻi by Hawaiian bonus is calculated on base points, before any elite or cabin
          bonus. Club 49, Culinary Journeys, Active Escapes and Families On the Go have no flight
          earning benefits.
        </li>
        <li>
          On American-issued (001) tickets, flights not operated under an American flight number use
          the other partner earn chart.
        </li>
      </ul>
      <footer className="mt-8 flex flex-col items-center text-center gap-2 text-xs sm:text-sm text-slate-500">
        <p>
          Calculations based on Atmos Rewards&apos;{" "}
          <a
            href={CHOOSE_HOW_YOU_EARN_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-800"
          >
            choose how you earn
          </a>{" "}
          and{" "}
          <a
            href={PARTNER_EARN_CHART_URL}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-800"
          >
            partner earning
          </a>{" "}
          pages as of October 2026.
        </p>
        <p>
          This website is an independent community tool and is not affiliated with, sponsored by, or
          endorsed by Alaska Airlines, Hawaiian Airlines, or any partner airlines.
        </p>
      </footer>
    </section>
  );
};
