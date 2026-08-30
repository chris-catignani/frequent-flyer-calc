declare module 'great-circle' {
  export function distance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit?: 'KM' | 'MI' | 'NM' | 'YD' | 'FT',
  ): number;
}
