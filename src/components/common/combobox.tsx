import React, { useState, useRef, useEffect, useId, useMemo } from "react";
import { ChevronDownIcon } from "./icons";

export interface ComboboxOption {
  label: string;
  value: string;
  group?: string;
  [key: string]: unknown;
}

export interface ComboboxProps<T = ComboboxOption | string> {
  label: string;
  options: T[];
  value: string;
  onChange: (value: string) => void;
  onInputChange?: (val: string) => void;
  getOptionLabel?: (opt: T) => string;
  getOptionValue?: (opt: T) => string;
  groupBy?: (opt: T) => string;
  filterOptions?: false | ((options: T[], query: string) => T[]);
  formatDisplayValue?: (value: string) => string;
  renderOption?: (opt: T) => React.ReactNode;
  freeSolo?: boolean;
  error?: string;
  helperText?: React.ReactNode;
  placeholder?: string;
  dataTestId?: string;
  errorTestId?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function Combobox<T = ComboboxOption | string>({
  label,
  options,
  value,
  onChange,
  onInputChange,
  getOptionLabel = (opt: T) =>
    typeof opt === "string" ? opt : (opt as ComboboxOption).label || "",
  getOptionValue = (opt: T) =>
    typeof opt === "string" ? opt : (opt as ComboboxOption).value || "",
  groupBy,
  filterOptions,
  formatDisplayValue,
  renderOption,
  freeSolo = false,
  error,
  helperText,
  placeholder,
  dataTestId,
  errorTestId,
  className = "w-full",
  onFocus,
  onBlur,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const listboxId = `${id}-listbox`;

  const selectedOption = useMemo(() => {
    return options.find((opt) => getOptionValue(opt) === value);
  }, [options, value, getOptionValue]);

  useEffect(() => {
    if (freeSolo) {
      const formatted =
        !isFocused && formatDisplayValue ? formatDisplayValue(value || "") : value || "";
      setInputValue(formatted);
    } else if (selectedOption != null) {
      const label = getOptionLabel(selectedOption);
      setInputValue(formatDisplayValue ? formatDisplayValue(label) : label);
    } else {
      setInputValue("");
    }
  }, [value, selectedOption, freeSolo, isFocused, formatDisplayValue, getOptionLabel]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (filterOptions === false) return options;
    if (typeof filterOptions === "function") return filterOptions(options, inputValue);
    if (!inputValue || (selectedOption != null && inputValue === getOptionLabel(selectedOption))) {
      return options;
    }
    const query = inputValue.toLowerCase();
    return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(query));
  }, [options, inputValue, selectedOption, getOptionLabel, filterOptions]);

  const { groupedEntries, flatOptionsList } = useMemo(() => {
    if (!groupBy) {
      return { groupedEntries: null, flatOptionsList: filteredOptions };
    }
    const map = new Map<string, T[]>();
    for (const opt of filteredOptions) {
      const g = groupBy(opt) || "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    }
    const groupedEntries = Array.from(map.entries());
    const flat = groupedEntries.flatMap(([, items]) => items);
    return { groupedEntries, flatOptionsList: flat };
  }, [filteredOptions, groupBy]);

  const handleSelect = (opt: T) => {
    const val = getOptionValue(opt);
    onChange(val);
    const display = formatDisplayValue ? formatDisplayValue(val) : getOptionLabel(opt);
    setInputValue(display);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < flatOptionsList.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : flatOptionsList.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatOptionsList.length) {
        handleSelect(flatOptionsList[highlightedIndex]);
      } else if (freeSolo && inputValue) {
        onChange(inputValue.toLowerCase());
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
      if (freeSolo && inputValue) {
        onChange(inputValue.toLowerCase());
        if (formatDisplayValue) {
          setInputValue(formatDisplayValue(inputValue));
        }
      }
    }
  };

  let globalOptionIdx = 0;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col ${className}`}
      data-testid={dataTestId}
    >
      <label htmlFor={id} className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
          }
          placeholder={placeholder}
          value={inputValue}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            onInputChange?.(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
            if (freeSolo) {
              onChange(e.target.value.toLowerCase());
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            if (freeSolo && formatDisplayValue) {
              setInputValue(formatDisplayValue(inputValue || value || ""));
            }
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-md border ${
            error
              ? "border-red-500 focus:border-red-600 focus:ring-red-200"
              : "border-slate-300 focus:border-primary focus:ring-primary/20"
          } bg-white px-3 py-2 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2`}
        />
        {!freeSolo && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {errorTestId ? (
        <span data-testid={errorTestId} className="mt-1 min-h-[16px] text-xs text-red-600">
          {error ? error : " "}
        </span>
      ) : helperText ? (
        <span className="mt-1 min-h-[16px] text-xs text-red-600">{helperText}</span>
      ) : (
        <span className="mt-1 min-h-[16px] text-xs text-transparent"> </span>
      )}

      {isOpen && flatOptionsList.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-hidden"
        >
          {groupedEntries
            ? groupedEntries.map(([group, groupOpts]) => (
                <li key={group} role="presentation">
                  <div className="sticky top-0 z-10 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {group}
                  </div>
                  <ul role="group" aria-label={group}>
                    {groupOpts.map((opt) => {
                      const optValue = getOptionValue(opt);
                      const isSelected = optValue === value;
                      const thisIdx = globalOptionIdx++;
                      const isHighlighted = thisIdx === highlightedIndex;
                      return (
                        <li
                          key={optValue}
                          id={`${listboxId}-option-${thisIdx}`}
                          role="option"
                          aria-selected={isSelected}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelect(opt);
                          }}
                          className={`cursor-pointer px-3 py-2 select-none hover:bg-slate-100 ${
                            isHighlighted ? "bg-slate-100" : ""
                          } ${isSelected ? "bg-primary/10 font-semibold text-primary" : "text-slate-800"}`}
                        >
                          {renderOption ? renderOption(opt) : getOptionLabel(opt)}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))
            : flatOptionsList.map((opt, idx) => {
                const optValue = getOptionValue(opt);
                const isSelected = optValue === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <li
                    key={optValue}
                    id={`${listboxId}-option-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(opt);
                    }}
                    className={`cursor-pointer px-3 py-2 select-none ${
                      isHighlighted ? "bg-slate-100" : ""
                    } ${isSelected ? "bg-primary/10 font-semibold text-primary" : "text-slate-800"}`}
                  >
                    {renderOption ? renderOption(opt) : getOptionLabel(opt)}
                  </li>
                );
              })}
        </ul>
      )}
    </div>
  );
}
