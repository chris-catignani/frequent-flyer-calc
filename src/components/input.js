import { AIRLINES, JETSTAR_AIRLINES, JETSTAR_FARE_CLASS_DISPLAY, JETSTAR_FARE_CLASSES, JETSTAR_NEW_ZEALAND_FARE_CLASSES, QANTAS_DOMESTIC_FARE_CLASSES, QANTAS_FARE_CLASS_DISPLAY, QANTAS_GRP_AIRLINES, QANTAS_INTL_FARE_CLASSES, WEBSITE_EARN_CATEGORIES } from "@/models/constants";
import { Autocomplete, TextField, Grid2 } from "@mui/material";

export const EliteStatusInput = ({ eliteStatus, onChange }) => {
  return (
    <Autocomplete
      disablePortal
      disableClearable
      value={eliteStatus}
      options={["Bronze", "Silver", "Gold", "Platinum", "Platinum One"]}
      sx={{ width: 175 }}
      size="small"
      onChange={(_, value) => onChange(value)}
      renderInput={(params) => <TextField {...params} label="Elite Status" />}
    />
  );
};

export const RouteInput = ({segmentInput, errors, onChange}) => {
  return (
    <Grid2 container justifyContent="center" alignItems="center" spacing={1}>
      <AirlineInput
        value={segmentInput.airline}
        error={errors['airline']}
        onChange={(value) => {
          const newSegmentInput = segmentInput.clone({ airline: value });
          if (shouldClearFareClassForAirlineChange(segmentInput, value)) {
            newSegmentInput.fareClass = "";
          }
          onChange(newSegmentInput);
        }}
      />
      <AirportInput
        label={"From (e.g. syd)"}
        value={segmentInput.fromAirportText}
        error={errors['fromAirportText']}
        onChange={(value) => {
          const newSegmentInput = segmentInput.clone({ fromAirportText: value });
          if (shouldClearFareClassForAirportChange(segmentInput.airline, segmentInput.fromAirportText, value)) {
            newSegmentInput.fareClass = "";
          }
          onChange(newSegmentInput);
        }}
      />
      <AirportInput
        label={"To (e.g. mel)"}
        value={segmentInput.toAirportText}
        error={errors['toAirportText']}
        onChange={(value) => {
          const newSegmentInput = segmentInput.clone({ toAirportText: value });
          if (shouldClearFareClassForAirportChange(segmentInput.airline, segmentInput.toAirportText, value)) {
            newSegmentInput.fareClass = "";
          }
          onChange(newSegmentInput);
        }}
      />
      <FareClassInput
        segmentInput={segmentInput}
        error={errors['fareClass']}
        onChange={(value) => {
          onChange(segmentInput.clone({ fareClass: value }));
        }}
      />
    </Grid2>
  );
}

const shouldClearFareClassForAirlineChange = (segmentInput, airline) => {
  // if the airline did not change
  if (airline === segmentInput?.airline) {
    return false
  }

  // if it used to be a qantas airline, and now it's not.
  // or both are qantas group airlines
  return (
    QANTAS_GRP_AIRLINES.has(airline) !== QANTAS_GRP_AIRLINES.has(segmentInput?.airline) ||
    QANTAS_GRP_AIRLINES.has(airline) && QANTAS_GRP_AIRLINES.has(segmentInput?.airline)
  )
}

const shouldClearFareClassForAirportChange = (airline, originalAirport, newAirport) => {
  // ignore in progress typing
  if(newAirport.length !== 3) {
    return false
  }

  // to be lazy, clear if this is a qantas grp airline
  return QANTAS_GRP_AIRLINES.has(airline);
};

const AirlineInput = ({ value, error, onChange }) => {
  const airlines = Object.entries(AIRLINES).map(([iata, name]) => {
    return {
      airlineLabel: `${name} (${iata})`,
      iata,
      id: iata,
    };
  });

  return (
    <Autocomplete
      disablePortal
      disableClearable
      options={airlines}
      getOptionLabel={(airline) => airline.airlineLabel || ""}
      value={airlines.find((airline) => airline.iata === value) || ""}
      onChange={(_, value) => onChange(value?.iata)}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={error ? error : " "}
          label="Airline"
        />
      )}
    />
  );
};

const AirportInput = ({ label, value, error, onChange }) => {
  return (
    <TextField
      label={label}
      value={value}
      error={error}
      helperText={error ? error : " "}
      onChange={(event) => {
        onChange(event.target.value?.toLowerCase()?.trim());
      }}
      sx={{ width: 150 }}
    />
  );
};

const QantasFareClassInput = ({ segmentInput, error, onChange }) => {
  let fareClassOptions = [];
  if(segmentInput.fromAirport && segmentInput.toAirport) {
    if (segmentInput.fromAirport.country === "Australia" && segmentInput.toAirport.country === "Australia") {
      fareClassOptions = Object.keys(QANTAS_DOMESTIC_FARE_CLASSES);
      fareClassOptions.push(...WEBSITE_EARN_CATEGORIES.qf[0].replace(/\W/g, '').split('').map(letter => letter.toLowerCase()))
    } else {
      fareClassOptions = Object.keys(QANTAS_INTL_FARE_CLASSES);
      fareClassOptions.push(...WEBSITE_EARN_CATEGORIES.qf[1].replace(/\W/g, '').split('').map(letter => letter.toLowerCase()))
    }
  }

  const options = fareClassOptions.map(fareClass => {
    return {
      display: QANTAS_FARE_CLASS_DISPLAY[fareClass] || fareClass,
      data: fareClass,
      id: fareClass,
    };
  })

  return (
    <Autocomplete
      disablePortal
      disableClearable
      options={options}
      getOptionLabel={(option) => option.display || ""}
      value={options.find((option) => option.data === segmentInput.fareClass) || ''}
      onChange={(_, value) => onChange(value?.data)}
      groupBy={(option) => option.display.length === 1 ? "Booking Class" : "Fare Type"}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={error ? error : " "}
          label="Fare Class" />
      )}
    />
  );
}

const JetstarFareClassInput = ({ segmentInput, error, onChange }) => {
  let fareClassOptions = [];
  if (segmentInput.fromAirport && segmentInput.toAirport) {
    if (segmentInput.airline === "jq" && segmentInput.fromAirport.country === "New Zealand" && segmentInput.toAirport.country === "New Zealand") {
      fareClassOptions = Object.keys(JETSTAR_NEW_ZEALAND_FARE_CLASSES);
    } else {
      fareClassOptions = Object.keys(JETSTAR_FARE_CLASSES);
    }
  }

  const options = fareClassOptions.map(fareClass => {
    return {
      display: JETSTAR_FARE_CLASS_DISPLAY[fareClass],
      data: fareClass,
      id: fareClass,
    };
  })

  return (
    <Autocomplete
      disablePortal
      disableClearable
      options={options}
      getOptionLabel={(option) => option.display || ""}
      value={options.find((option) => option.data === segmentInput.fareClass) || ''}
      onChange={(_, value) => onChange(value?.data)}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          helperText={error ? error : " "}
          label="Fare Class" />
      )}
    />
  );
}

const FareClassInput = ({ segmentInput, error, onChange }) => {
  if (segmentInput.airline === "qf") {
    return (
      <QantasFareClassInput segmentInput={segmentInput} error={error} onChange={onChange} />
    )
  } else if (JETSTAR_AIRLINES.has(segmentInput.airline)) {
    return (
      <JetstarFareClassInput segmentInput={segmentInput} error={error} onChange={onChange} />
    )
  }

  return (
    <TextField
      value={segmentInput.fareClass}
      error={error}
      helperText={error ? error : " "}
      onChange={(event) => {
        onChange(event.target.value?.trim()?.toLowerCase())
      }}
      label='Fare Class (e.g. "y" or "i")'
      sx={{ width: 250 }}
    />
  );
};
