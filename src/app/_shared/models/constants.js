export const ONEWORLD_AIRLINES = {
  as: 'Alaska Airlines',
  aa: 'American Airlines',
  ba: 'British Airways',
  cx: 'Cathay Pacific',
  fj: 'Fiji Airways',
  ay: 'Finnair',
  ib: 'Iberia',
  i2: 'Iberia Express',
  jl: 'Japan Airlines',
  nu: 'Japan Transocean Air',
  mh: 'Malaysia Airlines',
  qr: 'Qatar Airways',
  at: 'Royal Air Maroc',
  rj: 'Royal Jordanian',
  ul: 'SriLankan Airlines',
  qf: 'Qantas',
};

export const JETSTAR_AIRLINES = {
  jq: 'Jetstar Airlines',
  '3k': 'Jetstar Asia',
  gk: 'Jetstar Japan',
};

export const LATAM_AIRLINES = {
  la: 'LATAM',
  jj: 'LATAM Brasil',
  '4c': 'LATAM Colombia',
  xl: 'LATAM Ecuador',
  lu: 'LATAM Express',
  lp: 'LATAM Peru',
};

export const QANTAS_GRP_AIRLINES = {
  qf: 'Qantas',
  ...JETSTAR_AIRLINES,
};

//TODO more here
export const SKYTEAM_AIRLINES = {
  af: 'Air France',
  mu: 'China Eastern',
  kl: 'KLM',
};

//TODO more here
export const STAR_ALLIANCE_AIRLINES = {};

// TODO more here
export const NON_ALLIANCE_AIRLINES = {
  ek: 'Emirates',
  ly: 'EL AL',
  ws: 'WestJet',
};

export const ALL_AIRLINES = {
  ...ONEWORLD_AIRLINES,
  ...SKYTEAM_AIRLINES,
  ...STAR_ALLIANCE_AIRLINES,
  ...JETSTAR_AIRLINES,
  ...LATAM_AIRLINES,
  ...NON_ALLIANCE_AIRLINES,
};
