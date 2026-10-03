import React from "react";
import { Combobox } from "@/components/common/combobox";

export interface EliteStatusInputProps {
  eliteStatus: string;
  onChange: (value: string) => void;
  options?: string[];
}

const ELITE_STATUS_OPTIONS = ["Bronze", "Silver", "Gold", "Platinum", "Platinum One"];

export const EliteStatusInput: React.FC<EliteStatusInputProps> = ({
  eliteStatus,
  onChange,
  options = ELITE_STATUS_OPTIONS,
}) => {
  return (
    <div data-testid="elite-status-input" className="w-full sm:w-44">
      <Combobox
        label="Elite Status"
        options={options}
        value={eliteStatus}
        onChange={onChange}
        getOptionLabel={(opt) => opt}
        getOptionValue={(opt) => opt}
        dropdownClassName="w-full min-w-full sm:min-w-[200px] right-0 sm:right-0 sm:left-auto"
      />
    </div>
  );
};
