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

  const SegmentResult = ({segmentResult}) => {
    return (
      <div>
        <div>
          {segmentResult.segment.fromAirport} - {segmentResult.segment.toAirport}
        </div>
        {!segmentResult.error &&
          <div>
            <div>
              {segmentResult.segment.airline} {segmentResult.segment.fareClass} class maps to {segmentResult.calculation.fareEarnCategory}
            </div>
            <div>
              Qantas Points: {segmentResult.calculation.qantasPoints}
            </div>
            <div>
              Status Credits: {segmentResult.calculation.statusCredits}
            </div>
            <div>
              <a href={segmentResult.calculation.ruleUrl} target="_blank">{segmentResult.calculation.rule} rule</a> - {segmentResult.calculation.notes}
            </div>
          </div>
         }
         {segmentResult.error &&
          <div>
            Error: {segmentResult.error.message}
          </div>
         }
      </div>
    )
  }

  const Results = ({calculatedData}) => {
    if (!calculatedData) {
      return <></>
    }

    const segmentResults = calculatedData.segmentResults.map(segmentResult => {
      return (
        <li key={segmentResult.segment.toString()}>
          <SegmentResult segmentResult={segmentResult} />
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
            {segmentResults}
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
