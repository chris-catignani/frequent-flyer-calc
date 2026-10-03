import type React from "react";
import type { SegmentInput } from "@/models/segmentInput";
import type { ProgramOptions } from "@/types/program";

export interface FareClassInputRenderProps {
  segmentInputIdx: number;
  segmentInput: SegmentInput;
  error?: string;
  onChange: (value: string) => void;
}

export interface SegmentInputAdapter {
  renderFareClassInput?: (props: FareClassInputRenderProps) => React.ReactNode | null | undefined;
  shouldClearFareClassOnAirlineChange?: (segment: SegmentInput, newAirline: string) => boolean;
  shouldClearFareClassOnAirportChange?: (
    segment: SegmentInput,
    field: "from" | "to",
    newAirportText: string
  ) => boolean;
  /** Whether the fare class must be entered for this segment. Defaults to true. */
  isFareClassRequired?: (segment: SegmentInput, programOptions: ProgramOptions) => boolean;
  validateSegment?: (
    segment: SegmentInput,
    idx: number,
    programOptions?: ProgramOptions
  ) => Record<string, string> | undefined;
}

export interface AirlineOption {
  airlineLabel: string;
  iata: string;
  groupName: string;
  id: string;
}

export type SegmentErrors = Record<number, Record<string, string>>;
