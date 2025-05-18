// https://enrich.malaysiaairlines.com/enrich/partners.html

const buildFareClassObj = (data) => {
  const fareClassObj = {
    fare_class: {},
    earning: {},
  };

  data.forEach(([fareClasses, fareCategory, earningRate]) => {
    fareClasses.split('/').forEach((fareClass) => {
      fareClassObj['fare_class'][fareClass.trim().toLowerCase()] = fareCategory;
      fareClassObj['earning'][fareClass.trim().toLowerCase()] = earningRate;
    });
  });

  return fareClassObj;
};

export const MALAYSIA_FARE_CLASSES = {
  aa: {
    ...buildFareClassObj([
      ['F / A', 'first', 1.5],
      ['P', 'first', 1.25],
      ['J / D / R / I', 'business', 1.25],
      ['Y', 'economy', 1],
      ['H', 'economy', 0.75],
      ['K / M / W / L / V', 'economy', 0.5],
      ['S / G', 'economy', 0.25],
      ['N / O / Q', 'none', 0.0],
    ]),
  },
  ay: {
    ...buildFareClassObj([
      ['J / C / D ', 'business', 1.25],
      ['I / R', 'business', 1.0],
      ['Y / B / H', 'economy', 1.0],
      ['V / L / N / S / Q / O / K / M / Z', 'economy', 0.5],
      ['G', 'economy', 0.25],
    ]),
  },
  ba: {
    ...buildFareClassObj([
      ['F / A', 'first', 1.5],
      ['J / C / D / R', 'business', 1.25],
      ['I', 'business', 1.0],
      ['W / E / T', 'economy', 1.0],
      ['Y / B / H', 'economy', 1.0],
      ['K / M', 'economy', 0.5],
      ['L / V / S / N / Q / O / G', 'economy', 0.25],
    ]),
  },
  cx: {
    ...buildFareClassObj([
      ['F / A', 'first', 1.5],
      ['J / C / D / P / I', 'business', 1.25],
      ['W / R / E', 'economy', 1.1],
      ['Y / B', 'economy', 1.0],
      ['H / K / M', 'economy', 0.5],
    ]),
  },
  mh: {
    ...buildFareClassObj([
      ['F / A', 'first', 1.8],
      ['P', 'first', 1.4],
      ['J', 'business', 1.4],
      ['C / D', 'business', 1.3],
      ['Z', 'business', 1.1],
      ['Y / B / H', 'economy', 1.0],
      ['K / M / L / V', 'economy', 0.75],
      ['S / N', 'economy', 0.5],
      ['Q / O / G', 'economy', 0.25],
    ]),
  },
  qr: {
    ...buildFareClassObj([
      ['F / A', 'first', 1.5],
      ['J / C / D / I', 'business', 1.25],
      ['R', 'business', 1.0],
      ['P', 'business', 0.75],
      ['Y / B / H', 'economy', 1.0],
      ['K / M', 'economy', 0.5],
      ['L / V / S / N / T / Q / O / G / W', 'economy', 0.25],
    ]),
  },
};

export const MALAYSIA_RULE_URLS = {
  aa: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/american-airlines.html',
  ay: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/finnair.html',
  ba: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/british-airways.html',
  cx: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/cathay-pacific.html',
  mh: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/mag/malaysia-airlines.html',
  qr: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/qatar-airways.html',
};
