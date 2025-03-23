import { Favorite } from '@mui/icons-material';
import { Grid2, Typography } from '@mui/material';

export const Footer = () => {
  return (
    <Grid2
      mx={2}
      mt={5}
      container
      direction="column"
      justifyContent="center"
      alignContent="center"
      spacing={2}
    >
      <Grid2 container justifyContent="center" alignContent="center" spacing={0}>
        <Typography textAlign="center">Calculations based on&nbsp;</Typography>
        <Typography>
          <a
            href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
            target="_blank"
          >
            Qantas/Jetstar
          </a>
        </Typography>
        <Typography>&nbsp;and&nbsp;</Typography>
        <Typography>
          <a
            href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
            target="_blank"
          >
            Partner
          </a>
        </Typography>
        <Typography>&nbsp;earning tables as of January 2025.</Typography>
      </Grid2>
      <Typography textAlign="center">
        This webpage is not affiliated with Qantas Airlines.
      </Typography>
      <Grid2 container justifyContent="center" alignContent="center" spacing={0}>
        <Typography>Made with&nbsp;</Typography>
        <Favorite fontSize="small" sx={{ color: 'red' }} />
        <Typography>&nbsp;from&nbsp;</Typography>
        <Typography>
          <a href="https://www.flyertalk.com/forum/members/delighted5153.html" target="_blank">
            delighted5153
          </a>
        </Typography>
        <Typography>&nbsp;&#40;Feedback welcome!&#41;</Typography>
      </Grid2>
    </Grid2>
  );
};
