import React from "react";
import { Favorite } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 5,
        mb: 2,
        px: { xs: 1.5, sm: 2 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1.5,
        width: "100%",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Calculations based on{" "}
        <a
          href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
          target="_blank"
          rel="noreferrer"
        >
          Qantas/Jetstar
        </a>{" "}
        and{" "}
        <a
          href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
          target="_blank"
          rel="noreferrer"
        >
          Partner
        </a>{" "}
        earning tables as of March 2026.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This website is an independent community tool and is not affiliated with, sponsored by, or
        endorsed by Qantas Airways, Jetstar Airways, or any partner airlines.
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        Made with&nbsp;
        <Favorite fontSize="small" sx={{ color: "error.main", verticalAlign: "middle" }} />
        &nbsp;from&nbsp;
        <a
          href="https://www.flyertalk.com/forum/members/delighted5153.html"
          target="_blank"
          rel="noreferrer"
        >
          delighted5153
        </a>
        &nbsp;&#40;Feedback welcome!&#41;
      </Typography>
    </Box>
  );
};
