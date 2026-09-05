import React from "react";
import { Combobox } from "@/components/common/combobox";

export interface EliteStatusInputProps {
  eliteStatus: string;
  onChange: (value: string) => void;
}

const ELITE_STATUS_OPTIONS = ["Bronze", "Silver", "Gold", "Platinum", "Platinum One"];

export const EliteStatusInput: React.FC<EliteStatusInputProps> = ({ eliteStatus, onChange }) => {
  return (
    <div data-testid="elite-status-input" className="w-full sm:w-44">
      <Combobox
        label="Elite Status"
        options={ELITE_STATUS_OPTIONS}
        value={eliteStatus}
        onChange={onChange}
        getOptionLabel={(opt) => opt}
        getOptionValue={(opt) => opt}
      />
    </div>
  );
};
