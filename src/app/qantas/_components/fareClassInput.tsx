import React from "react";
import {
  GenericFareClassInput,
  type FareClassInputRenderProps,
  type SegmentInputAdapter,
} from "@/app/_shared/components/segmentInput";
import { QANTAS_GRP_AIRLINES } from "@/app/_shared/models/constants";
import {
  JAL_AIRLINES,
  JAL_DOMESTIC_FARE_CLASSES,
  JAL_DOMESTIC_FARE_CLASS_DISPLAY,
  JETSTAR_AIRLINES,
  JETSTAR_DOMESTIC_FARE_CLASSES,
  JETSTAR_FARE_CLASS_DISPLAY,
  JETSTAR_INTL_FARE_CLASSES,
  JETSTAR_NEW_ZEALAND_FARE_CLASSES,
  QANTAS_DOMESTIC_FARE_CLASSES,
  QANTAS_FARE_CLASS_DISPLAY,
  QANTAS_INTL_FARE_CLASSES,
  WEBSITE_EARN_CATEGORIES,
} from "@/app/_shared/models/qantasConstants";

export const QantasFareClassInput: React.FC<FareClassInputRenderProps> = ({
  segmentInputIdx,
  segmentInput,
  error,
  onChange,
}) => {
  let fareClassOptions: string[] = [];
  const qfWebCategories = WEBSITE_EARN_CATEGORIES.qf as string[];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.fromAirport.country === "Australia" &&
      segmentInput.toAirport.country === "Australia"
    ) {
      fareClassOptions = Object.keys(QANTAS_DOMESTIC_FARE_CLASSES);
      fareClassOptions.push(
        ...qfWebCategories[0]
          .replace(/\W/g, "")
          .split("")
          .map((letter) => letter.toLowerCase())
          .sort()
      );
    } else {
      fareClassOptions = Object.keys(QANTAS_INTL_FARE_CLASSES);
      fareClassOptions.push(
        ...qfWebCategories[1]
          .replace(/\W/g, "")
          .split("")
          .map((letter) => letter.toLowerCase())
          .sort()
      );
    }
  }

  return (
    <GenericFareClassInput
      segmentInputIdx={segmentInputIdx}
      options={fareClassOptions}
      value={segmentInput.fareClass || ""}
      displayLookup={QANTAS_FARE_CLASS_DISPLAY}
      onChange={onChange}
      groupBy={(option) => (option.length === 1 ? "Booking Class" : "Fare Type")}
      error={error}
    />
  );
};

export const JetstarFareClassInput: React.FC<FareClassInputRenderProps> = ({
  segmentInputIdx,
  segmentInput,
  error,
  onChange,
}) => {
  let fareClassOptions: string[] = [];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (
      segmentInput.airline === "jq" &&
      segmentInput.fromAirport.country === "New Zealand" &&
      segmentInput.toAirport.country === "New Zealand"
    ) {
      fareClassOptions = Object.keys(JETSTAR_NEW_ZEALAND_FARE_CLASSES);
    } else if (
      segmentInput.airline === "jq" &&
      segmentInput.fromAirport.country === "Australia" &&
      segmentInput.toAirport.country === "Australia"
    ) {
      fareClassOptions = Object.keys(JETSTAR_DOMESTIC_FARE_CLASSES);
    } else {
      fareClassOptions = Object.keys(JETSTAR_INTL_FARE_CLASSES);
    }
  }

  return (
    <GenericFareClassInput
      segmentInputIdx={segmentInputIdx}
      options={fareClassOptions}
      value={segmentInput.fareClass || ""}
      displayLookup={JETSTAR_FARE_CLASS_DISPLAY}
      onChange={onChange}
      error={error}
    />
  );
};

export const JALFareClassInput: React.FC<FareClassInputRenderProps> = ({
  segmentInputIdx,
  segmentInput,
  error,
  onChange,
}) => {
  const fareClassOptions = Object.keys(JAL_DOMESTIC_FARE_CLASSES);

  return (
    <GenericFareClassInput
      segmentInputIdx={segmentInputIdx}
      options={fareClassOptions}
      value={segmentInput.fareClass || ""}
      displayLookup={JAL_DOMESTIC_FARE_CLASS_DISPLAY}
      onChange={onChange}
      error={error}
    />
  );
};

export const qantasSegmentInputAdapter: SegmentInputAdapter = {
  renderFareClassInput: ({ segmentInputIdx, segmentInput, error, onChange }) => {
    if (segmentInput.airline === "qf") {
      return (
        <QantasFareClassInput
          segmentInputIdx={segmentInputIdx}
          segmentInput={segmentInput}
          error={error}
          onChange={onChange}
        />
      );
    } else if (JETSTAR_AIRLINES.has(segmentInput.airline)) {
      return (
        <JetstarFareClassInput
          segmentInputIdx={segmentInputIdx}
          segmentInput={segmentInput}
          error={error}
          onChange={onChange}
        />
      );
    } else if (
      JAL_AIRLINES.has(segmentInput.airline) &&
      segmentInput.fromAirport?.country === "Japan" &&
      segmentInput.toAirport?.country === "Japan"
    ) {
      return (
        <JALFareClassInput
          segmentInputIdx={segmentInputIdx}
          segmentInput={segmentInput}
          error={error}
          onChange={onChange}
        />
      );
    }

    return null;
  },

  shouldClearFareClassOnAirlineChange: (segmentInput, newAirline) => {
    if (newAirline === segmentInput.airline) {
      return false;
    }

    const wasQantas = Boolean(segmentInput.airline && segmentInput.airline in QANTAS_GRP_AIRLINES);
    const isQantas = newAirline in QANTAS_GRP_AIRLINES;
    const wasJal = Boolean(segmentInput.airline && JAL_AIRLINES.has(segmentInput.airline));
    const isJal = JAL_AIRLINES.has(newAirline);

    return (
      isQantas !== wasQantas || (isQantas && wasQantas) || isJal !== wasJal || (isJal && wasJal)
    );
  },

  shouldClearFareClassOnAirportChange: (segmentInput, _field, newAirportText) => {
    if (JAL_AIRLINES.has(segmentInput.airline)) {
      return true;
    }

    if (newAirportText.length !== 3) {
      return false;
    }

    return segmentInput.airline in QANTAS_GRP_AIRLINES;
  },
};
