import { AIRLINES, JETSTAR_AIRLINES, JETSTAR_FARE_CLASS_DISPLAY, JETSTAR_FARE_CLASSES, JETSTAR_NEW_ZEALAND_FARE_CLASSES, QANTAS_DOMESTIC_FARE_CLASSES, QANTAS_FARE_CLASS_DISPLAY, QANTAS_INTL_FARE_CLASSES, WEBSITE_EARN_CATEGORIES } from "@/models/constants";
import { getAirport } from "@/utils/airports";
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

export const RouteInput = ({segment, errors, onChange}) => {
  return (
    <Grid2 container justifyContent="center" alignItems="center" spacing={1}>
      <AirlineInput
        value={segment.airline}
        error={errors['airline']}
        onChange={(value) => {
          const newSegment = segment.clone({ airline: value });
          if (shouldClearFareClass(segment, value)) {
            newSegment.fareClass = "";
          }
          onChange(newSegment);
        }}
      />
      <AirportInput
        label={"From (e.g. syd)"}
        value={segment.fromAirport}
        error={errors['fromAirport']}
        onChange={(value) => {
          onChange(segment.clone({ fromAirport: value }));
        }}
      />
      <AirportInput
        label={"To (e.g. mel)"}
        value={segment.toAirport}
        error={errors['toAirport']}
        onChange={(value) => {
          onChange(segment.clone({ toAirport: value }));
        }}
      />
      <FareClassInput
        segment={segment}
        error={errors['fareClass']}
        onChange={(value) => {
          onChange(segment.clone({ fareClass: value }));
        }}
      />
    </Grid2>
  );
}

const shouldClearFareClass = (segment, airline) => {
  if (airline === segment?.airline) {
    return false
  }

  const qantasAirlines = ['qf', 'jq', '3k', 'gk']
  return (
    qantasAirlines.includes(airline) !== qantasAirlines.includes(segment?.airline) ||
    qantasAirlines.includes(airline) && qantasAirlines.includes(segment?.airline)
  )
}

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

const QantasFareClassInput = ({ segment, error, onChange }) => {
  const fromAirport = getAirport(segment.fromAirport);
  const toAirport = getAirport(segment.toAirport);

  let fareClassOptions = [];
  if(fromAirport && toAirport) {
    if (fromAirport.country === "Australia" && toAirport.country === "Australia") {
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
      value={options.find((option) => option.data === segment.fareClass) || ''}
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

const JetstarFareClassInput = ({ segment, error, onChange }) => {
  const fromAirport = getAirport(segment.fromAirport);
  const toAirport = getAirport(segment.toAirport);

  let fareClassOptions = [];
  if (fromAirport && toAirport) {
    if (segment.airline === "jq" && fromAirport.country === "New Zealand" && toAirport.country === "New Zealand") {
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
      value={options.find((option) => option.data === segment.fareClass) || ''}
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

const FareClassInput = ({ segment, error, onChange }) => {
  if (segment.airline === "qf") {
    return (
      <QantasFareClassInput segment={segment} error={error} onChange={onChange} />
    )
  } else if (JETSTAR_AIRLINES.has(segment.airline)) {
    return (
      <JetstarFareClassInput segment={segment} error={error} onChange={onChange} />
    )
  }

  return (
    <TextField
      value={segment.fareClass}
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
