import React, { Suspense } from "react";
import { CalculatorSkeleton } from "@/components/qantas/calculatorSkeleton";
import { QantasCalculator } from "@/components/qantas/calculator";
import { FaqAndInfo } from "@/components/qantas/faqAndInfo";
import { ChangeLog } from "@/components/qantas/changeLog";
import { Footer } from "@/components/qantas/footer";

export default function Qantas() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 my-4 w-full min-w-0 flex flex-col items-center gap-2">
      <header className="w-full text-center my-2">
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
          Qantas Points and Status Credits Calculator
        </h1>
      </header>

      <Suspense fallback={<CalculatorSkeleton />}>
        <QantasCalculator />
      </Suspense>

      <FaqAndInfo />
      <ChangeLog />
      <Footer />
    </main>
  );
}
