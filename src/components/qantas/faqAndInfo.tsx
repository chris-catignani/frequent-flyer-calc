import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export const FaqAndInfo: React.FC = () => {
  return (
    <Box mt={5} sx={{ width: "100%" }}>
      {/* Overview & Key Rules Guide */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
          How Qantas Points &amp; Status Credits Are Calculated
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Earnings are determined on a per-segment basis using the marketing airline (the flight
          number on your ticket), the fare class booked, and the great-circle distance between
          airports.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600} gutterBottom>
              Distance Bands &amp; Minimums
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qantas publishes earning tables with distance bands for Qantas, Jetstar, and partner
              airlines. Points and Status Credits depend on the distance band and the fare class
              booked. Eligible Qantas flights also include a Minimum Points Guarantee.
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600} gutterBottom>
              Elite Status Tier Multipliers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Eligible flights marketed by Qantas, Jetstar, and American Airlines earn bonus points
              based on status tier: Silver (+50%), Gold (+75%), and Platinum / Platinum One (+100%).
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "action.hover",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600} gutterBottom>
              Partner Airlines &amp; Alliances
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>oneworld</strong> partners earn both Points and Status Credits. Non-alliance
              partners like Emirates, LATAM, and WestJet earn Points only.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Frequently Asked Questions */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" fontWeight={600} sx={{ mb: 1.5 }}>
          Frequently Asked Questions
        </Typography>

        <Accordion defaultExpanded={false} slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq1-header"
            aria-controls="faq1-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              How are Qantas Points and Status Credits calculated?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Points and Status Credits are calculated per segment based on the marketing airline
              (the flight number booked), fare class letter, route distance (using great-circle
              mileage), and elite status tier. Status Credits are flat allocations per distance
              band, while Qantas Points scale with elite status bonuses on eligible airlines.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq2-header"
            aria-controls="faq2-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              Where can I find official Qantas earning tables and fare classes?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" paragraph>
              Official tables published by Qantas:
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2.5, m: 0, typography: "body2", color: "text.secondary" }}
            >
              <li>
                <Link
                  href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html"
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  Qantas and Jetstar Earning Tables
                </Link>{" "}
                — Distance bands and earn rates for Qantas and Jetstar flights.
              </li>
              <li>
                <Link
                  href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html"
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  Partner Airline Earning Tables
                </Link>{" "}
                — Distance bands and earn rates for oneworld and non-alliance partner airlines.
              </li>
              <li>
                <Link
                  href="https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html"
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  Fare Categories &amp; Class Tables
                </Link>{" "}
                — Mapping booking class letters to earn categories across all partner airlines.
              </li>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq3-header"
            aria-controls="faq3-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              How do elite status tier bonuses work?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Silver (+50%), Gold (+75%), Platinum (+100%), and Platinum One (+100%) members receive
              bonus Qantas Points when travelling on eligible flights with a Qantas (QF), Jetstar
              (JQ/GK), or American Airlines (AA) flight number. Elite status bonuses apply to Qantas
              Points only and do not increase the number of Status Credits earned.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq4-header"
            aria-controls="faq4-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              Which partner airlines earn Status Credits?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Only <strong>oneworld alliance</strong> partner airlines earn Status Credits in
              addition to Qantas Points. These include American Airlines, British Airways, Cathay
              Pacific, Japan Airlines, Qatar Airways, Finnair, Iberia, Malaysia Airlines, Royal
              Jordanian, Royal Air Maroc, SriLankan Airlines, and Alaska Airlines. Non-oneworld
              partners (such as Emirates, LATAM, WestJet, and China Eastern) earn Qantas Points
              only.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq5-header"
            aria-controls="faq5-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              Do Jetstar flights earn Qantas Points and Status Credits?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Yes, provided you purchase an eligible fare bundle with Jetstar (Starter Plus, Flex,
              Flex Plus, Starter Max, or Business Max). Basic unbundled Economy Starter fares do not
              earn Qantas Points or Status Credits.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq6-header"
            aria-controls="faq6-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              Why do some results differ slightly from the official Qantas calculator?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Small variations (typically 1–10 points) can occur due to subtle great-circle distance
              calculation differences or specific domestic codeshare rules. You can use our
              &quot;Compare With Qantas&quot; switch to verify calculations directly against
              Qantas&apos;s live API.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion slotProps={{ transition: { unmountOnExit: true } }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id="faq7-header"
            aria-controls="faq7-content"
          >
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              What is a Status Run?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              A Status Run is an itinerary planned specifically to maximize Status Credits at the
              lowest cost per credit, helping frequent flyers reach or retain elite tiers (Silver,
              Gold, Platinum). You can use this calculator to test and optimize multi-city routes.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};
