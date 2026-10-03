import React, { Suspense } from "react";
import { AlaskaCalculator } from "@/components/alaska/calculator";
import { AtmosInfo } from "@/components/alaska/atmosInfo";
import { CalculatorSkeleton } from "@/components/common/calculatorSkeleton";
import { ProgramNav } from "@/components/common/programNav";

export default function Alaska() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 my-4 w-full min-w-0 flex flex-col items-center gap-2">
      <header className="w-full text-center my-2">
        <ProgramNav current="/alaska" />
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
          Atmos Rewards Points and Status Points Calculator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Alaska Airlines · Hawaiian Airlines · partners
        </p>
      </header>

      <Suspense fallback={<CalculatorSkeleton />}>
        <AlaskaCalculator />
      </Suspense>

      <AtmosInfo />
    </main>
  );
}
