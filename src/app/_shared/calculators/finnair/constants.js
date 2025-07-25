// https://www.finnair.com/es-en/finnair-plus/collect-and-use-avios/collect-avios-and-tier-points-from-flights

const buildFinnairFareClassObj = (data) => {
  const fareClassObj = {
    fare_class: {},
  };

  data.forEach(([fareClasses, earningRate]) => {
    fareClasses.split(',').forEach((fareClass) => {
      fareClassObj['fare_class'][fareClass.trim().toLowerCase()] = earningRate / 100;
    });
  });

  return fareClassObj;
};

const buildFinnairFareClassEliteBonusObj = () => {
  return {
    status_multiplier: {
      basic: 0,
      silver: 0.1,
      gold: 0.15,
      platinum: 0.25,
      'platinum lumo': 0.25,
    },
  };
};

export const FINNAIR_FARE_CLASSES = {
  aa: {
    ...buildFinnairFareClassObj([
      ['F', 300],
      ['A', 250],
      ['J, C, D', 250],
      ['R, I', 150],
      ['W', 150],
      ['P', 100],
      ['Y, H', 100],
      ['K, L, M, V, S', 50],
      ['B, G, O, Q, N', 25],
    ]),
    ...buildFinnairFareClassEliteBonusObj(),
  },
};
