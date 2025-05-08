export const frequentFlyerPrograms = {
  malaysia: {
    eliteTiers: {
      blue: {
        requirements: {
          achieve: 0,
        },
      },
      silver: {
        requirements: {
          achieve: 30,
        },
      },
      gold: {
        requirements: {
          achieve: 60,
        },
      },
      platinum: {
        requirements: {
          achieve: 100,
        },
      },
    },
  },
  qantas: {
    eliteTiers: {
      bronze: {
        requirements: {
          achieve: 0,
          maintain: 0,
        },
      },
      silver: {
        requirements: {
          achieve: 300,
          maintain: 250,
        },
      },
      gold: {
        requirements: {
          achieve: 700,
          maintain: 600,
        },
      },
      platinum: {
        requirements: {
          achieve: 1400,
          maintain: 1200,
        },
      },
    },
  },
};

export const calcPercentageOfEliteTier = (program, eliteTier, elitePoints, initial) => {
  if (!frequentFlyerPrograms[program]) {
    console.error(`${program} not setup as a valid frequent flyer program`);
    return 0;
  } else if (!frequentFlyerPrograms[program]['eliteTiers'][eliteTier]) {
    console.error(`${eliteTier} not setup as a valid elite tier for ${program}`);
    return 0;
  }

  const requirement = initial ? 'achieve' : 'maintain';

  return (
    elitePoints /
    frequentFlyerPrograms[program]['eliteTiers'][eliteTier]['requirements'][requirement]
  );
};

export const getEliteTiersForProgram = (program) => {
  if (!frequentFlyerPrograms[program]) {
    console.error(`${program} not setup as a valid frequent flyer program`);
    return [];
  }

  return Object.keys(frequentFlyerPrograms[program]['eliteTiers']);
};

export const getEliteTierLevel = (program, eliteTier) => {
  return Object.keys(frequentFlyerPrograms[program]['eliteTiers']).indexOf(eliteTier);
};
