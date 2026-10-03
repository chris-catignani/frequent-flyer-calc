import React from "react";
import { requiresFareClass, toAtmosOptions } from "@/calculators/alaska/options";
import { CABIN_DISPLAY, getPartnerFareClasses } from "@/calculators/alaska/partnerCabins";
import { GenericFareClassInput } from "@/components/form/segmentInput";
import type { SegmentInputAdapter } from "@/types/segmentInput";

export const alaskaSegmentInputAdapter: SegmentInputAdapter = {
  isFareClassRequired: (segmentInput, programOptions) =>
    requiresFareClass(segmentInput.airline, toAtmosOptions(programOptions)),
  shouldClearFareClassOnAirlineChange: (segmentInput, newAirline) =>
    segmentInput.airline !== newAirline,
  renderFareClassInput: ({ segmentInputIdx, segmentInput, error, onChange }) => {
    const fareClasses = getPartnerFareClasses(segmentInput.airline);
    if (fareClasses.length === 0) {
      return null;
    }

    const byId = Object.fromEntries(fareClasses.map((fareClass) => [fareClass.id, fareClass]));
    const displayLookup = Object.fromEntries(
      fareClasses.map((fareClass) => [
        fareClass.id,
        `${fareClass.label} (${CABIN_DISPLAY[fareClass.cabin]})`,
      ])
    );

    return (
      <GenericFareClassInput
        segmentInputIdx={segmentInputIdx}
        options={fareClasses.map((fareClass) => fareClass.id)}
        value={segmentInput.fareClass}
        displayLookup={displayLookup}
        groupBy={(id) => CABIN_DISPLAY[byId[id].cabin]}
        onChange={onChange}
        error={error}
      />
    );
  },
};
