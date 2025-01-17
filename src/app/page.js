"use client"

import { calculate } from '@/utils/calculators/calculator';
import { Segment } from '@/models/segment'
import { useState } from 'react';

export default function Home() {

  const [routing, setRouting] = useState();
  const [calculationOutput, setCalculationOutput] = useState();

  const calculatePressed = () => {
    const segments = routing.split(",").map(routing => Segment.fromString(routing.trim()))
    setCalculationOutput(calculate(segments))
  }

  const SegmentResult = ({segment}) => {
    return (
      <div>
        <div>
          Qantas Points: {segment.calculation.qantasPoints}
        </div>
        <div>
          Status Credits: {segment.calculation.statusCredits}
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
        <li key={segment.segment.toString()}>
          <SegmentResult segment={segment} />
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
          <input name="routing" onChange={(event) => {setRouting(event.target.value)}}/>
        </label>
        <button onClick={calculatePressed}>
          Calculate
        </button>
      </div>
      <div>
        <Results calculatedData={calculationOutput} />
      </div>
    </div>
  );
}
