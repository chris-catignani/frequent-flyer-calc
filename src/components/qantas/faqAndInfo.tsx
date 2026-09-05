import React from "react";

export const FaqAndInfo: React.FC = () => {
  return (
    <section className="w-full mt-10" aria-label="Earning Rules and FAQ">
      {/* Overview & Key Rules Guide */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 mb-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          How Qantas Points &amp; Status Credits Are Calculated
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Earnings are determined on a per-segment basis using the marketing airline (the flight
          number on your ticket), the fare class booked, and the great-circle distance between
          airports.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
              Distance Bands &amp; Minimums
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Qantas publishes earning tables with distance bands for Qantas, Jetstar, and partner
              airlines. Points and Status Credits depend on the distance band and the fare class
              booked. Eligible Qantas flights also include a Minimum Points Guarantee.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
              Elite Status Tier Multipliers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eligible flights marketed by Qantas, Jetstar, and American Airlines earn bonus points
              based on status tier: Silver (+50%), Gold (+75%), and Platinum / Platinum One (+100%).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
              Partner Airlines &amp; Alliances
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>oneworld</strong> partners earn both Points and Status Credits. Non-alliance
              partners like Emirates, LATAM, and WestJet earn Points only.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 mb-3">Frequently Asked Questions</h2>

        <div className="space-y-2">
          {/* FAQ 1 */}
          <details
            id="faq1"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq1-header"
              aria-controls="faq1-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                How are Qantas Points and Status Credits calculated?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq1-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              Points and Status Credits are calculated per segment based on the marketing airline
              (the flight number booked), fare class letter, route distance (using great-circle
              mileage), and elite status tier. Status Credits are flat allocations per distance
              band, while Qantas Points scale with elite status bonuses on eligible airlines.
            </div>
          </details>

          {/* FAQ 2 */}
          <details
            id="faq2"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq2-header"
              aria-controls="faq2-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                Where can I find official Qantas earning tables and fare classes?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq2-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              <p className="mb-2">Official tables published by Qantas:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <a
                    href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Qantas and Jetstar Earning Tables
                  </a>{" "}
                  — Distance bands and earn rates for Qantas and Jetstar flights.
                </li>
                <li>
                  <a
                    href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Partner Airline Earning Tables
                  </a>{" "}
                  — Distance bands and earn rates for oneworld and non-alliance partner airlines.
                </li>
                <li>
                  <a
                    href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Fare Categories &amp; Class Tables
                  </a>{" "}
                  — Mapping booking class letters to earn categories across all partner airlines.
                </li>
              </ul>
            </div>
          </details>

          {/* FAQ 3 */}
          <details
            id="faq3"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq3-header"
              aria-controls="faq3-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                How do elite status tier bonuses work?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq3-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              Silver (+50%), Gold (+75%), Platinum (+100%), and Platinum One (+100%) members receive
              bonus Qantas Points when travelling on eligible flights with a Qantas (QF), Jetstar
              (JQ/GK), or American Airlines (AA) flight number. Elite status bonuses apply to Qantas
              Points only and do not increase the number of Status Credits earned.
            </div>
          </details>

          {/* FAQ 4 */}
          <details
            id="faq4"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq4-header"
              aria-controls="faq4-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                Which partner airlines earn Status Credits?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq4-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              Only <strong>oneworld alliance</strong> partner airlines earn Status Credits in
              addition to Qantas Points. These include American Airlines, British Airways, Cathay
              Pacific, Japan Airlines, Qatar Airways, Finnair, Iberia, Malaysia Airlines, Royal
              Jordanian, Royal Air Maroc, SriLankan Airlines, and Alaska Airlines. Non-oneworld
              partners (such as Emirates, LATAM, WestJet, and China Eastern) earn Qantas Points
              only.
            </div>
          </details>

          {/* FAQ 5 */}
          <details
            id="faq5"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq5-header"
              aria-controls="faq5-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                Do Jetstar flights earn Qantas Points and Status Credits?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq5-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              Yes, provided you purchase an eligible fare bundle with Jetstar (Starter Plus, Flex,
              Flex Plus, Starter Max, or Business Max). Basic unbundled Economy Starter fares do not
              earn Qantas Points or Status Credits.
            </div>
          </details>

          {/* FAQ 6 */}
          <details
            id="faq6"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq6-header"
              aria-controls="faq6-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">
                Why do some results differ slightly from the official Qantas calculator?
              </h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq6-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              Small variations (typically 1–10 points) can occur due to subtle great-circle distance
              calculation differences or specific domestic codeshare rules. You can use our
              &quot;Compare With Qantas&quot; switch to verify calculations directly against
              Qantas&apos;s live API.
            </div>
          </details>

          {/* FAQ 7 */}
          <details
            id="faq7"
            className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <summary
              id="faq7-header"
              aria-controls="faq7-content"
              className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex justify-between items-center text-slate-900 font-semibold"
            >
              <h3 className="text-sm font-semibold m-0 inline">What is a Status Run?</h3>
              <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div id="faq7-content" className="mt-3 text-sm text-slate-600 leading-relaxed">
              A Status Run is an itinerary planned specifically to maximize Status Credits at the
              lowest cost per credit, helping frequent flyers reach or retain elite tiers (Silver,
              Gold, Platinum). You can use this calculator to test and optimize multi-city routes.
            </div>
          </details>
        </div>
      </div>
    </section>
  );
};
