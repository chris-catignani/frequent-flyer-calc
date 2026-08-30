export type AirlineMap = Record<string, string>;

export const ONEWORLD_AIRLINES: AirlineMap = {
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
  wy: 'Oman Air',
  qf: 'Qantas',
  qr: 'Qatar Airways',
  at: 'Royal Air Maroc',
  rj: 'Royal Jordanian',
  ul: 'SriLankan Airlines',
};

export const JETSTAR_AIRLINES: AirlineMap = {
  jq: 'Jetstar Airlines',
  gk: 'Jetstar Japan',
};

export const LATAM_AIRLINES: AirlineMap = {
  la: 'LATAM',
  jj: 'LATAM Brasil',
  '4c': 'LATAM Colombia',
  xl: 'LATAM Ecuador',
  lu: 'LATAM Express',
  lp: 'LATAM Peru',
};

export const QANTAS_GRP_AIRLINES: AirlineMap = {
  qf: 'Qantas',
  ...JETSTAR_AIRLINES,
};

//TODO more here
const SKYTEAM_AIRLINES: AirlineMap = {
  af: 'Air France',
  mu: 'China Eastern',
  kl: 'KLM',
};

//TODO more here
const STAR_ALLIANCE_AIRLINES: AirlineMap = {};

// TODO more here
const NON_ALLIANCE_AIRLINES: AirlineMap = {
  ly: 'EL AL',
  ek: 'Emirates',
  ...JETSTAR_AIRLINES,
  ...LATAM_AIRLINES,
  ws: 'WestJet',
};

export const ALL_AIRLINES: AirlineMap = {
  ...ONEWORLD_AIRLINES,
  ...SKYTEAM_AIRLINES,
  ...STAR_ALLIANCE_AIRLINES,
  ...NON_ALLIANCE_AIRLINES,
};
