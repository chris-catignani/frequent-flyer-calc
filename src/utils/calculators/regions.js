export const isInRegion = (iata, region) => {
  return regions?.[region]?.has(iata)
}

const regions = {
  usaEastCoast: new Set(['bos', 'clt', 'ord', 'mia', 'jfk',  'ewr', 'mco', 'yyz', 'dca', 'iad']),
  usaWestCoast: new Set(['las', 'lax', 'phx', 'sfo', 'sea', 'yvr']),
  usaNycBos: new Set(['jfk', 'ewr', 'lga', 'bos'])
}
