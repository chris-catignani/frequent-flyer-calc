"use client"

import { calculate } from '@/utils/calculator';
import { useState } from 'react';

export default function Home() {

  const [getCalculationOutput, setCalculationOutput] = useState();

  const Segment = ({segment}) => {
    return (
      <div>
        <div>
          Qantas Points: {segment.qantasPoints}
        </div>
        <div>
          Status Credits: {segment.statusCredits}
        </div>
      </div>
    )
  }

  const Results = ({calculatedData}) => {
    if (!calculatedData) {
      return <></>
    }

    const segments = calculatedData.segments.map(segment => {
      return (
        <li key={segment.routing}>
          <Segment segment={segment} />
        </li>
      )
    })

    return (
      <div>
        <div>
          Earned Qantas Points: {calculatedData.qantasPoints}
        </div>
        <div>
          Earned Status Credits: {calculatedData.statusCredits}
        </div>
        <div>
          <ul>
            {segments}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4">
      <div className="flex items-center justify-center">
        <label>
          Input routing:
          <input name="routing" />
        </label>
        <button onClick={() => {setCalculationOutput(calculate())}}>
          Calculate
        </button>
      </div>
      <div>
        <Results calculatedData={getCalculationOutput} />
      </div>
    </div>
  );
}
