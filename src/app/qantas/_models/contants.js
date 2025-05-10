import { LATAM_AIRLINES, ONEWORLD_AIRLINES } from '@/app/_shared/models/constants';

export const PARTNER_ONEWORLD_AIRLINES = Object.keys(ONEWORLD_AIRLINES).filter(
  (iata) => iata !== 'qf',
);

export const PARTNER_NON_ONEWORLD_AIRLINES = [
  'af',
  'mu',
  'ly',
  'ek',
  'kl',
  'ws',
  ...Object.keys(LATAM_AIRLINES),
];
