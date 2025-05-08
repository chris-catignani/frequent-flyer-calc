// https://enrich.malaysiaairlines.com/enrich/partners.html

export const MALAYSIA_FARE_CLASSES = {
  aa: {
    fare_class: {
      f: 'first',
      a: 'first',
      p: 'first',

      j: 'business',
      d: 'business',
      r: 'business',
      i: 'business',

      y: 'economy',
      h: 'economy',
      k: 'economy',
      m: 'economy',
      w: 'economy',
      l: 'economy',
      v: 'economy',
      g: 'economy',
      s: 'economy',

      n: 'none',
      o: 'none',
      q: 'none',
    },
    earning: {
      f: 1.5,
      a: 1.5,
      p: 1.25,

      j: 1.25,
      d: 1.25,
      r: 1.25,
      i: 1.25,

      y: 1.0,
      h: 0.75,
      k: 0.5,
      m: 0.5,
      w: 0.5,
      l: 0.5,
      v: 0.5,
      g: 0.25,
      s: 0.25,

      n: 0,
      o: 0,
      q: 0,
    },
  },
  ay: {
    fare_class: {
      j: 'business',
      c: 'business',
      d: 'business',
      r: 'business',
      i: 'business',

      y: 'economy',
      b: 'economy',
      h: 'economy',

      v: 'economy',
      l: 'economy',
      n: 'economy',
      s: 'economy',
      q: 'economy',
      o: 'economy',
      k: 'economy',
      m: 'economy',
      z: 'economy',

      g: 'economy',
    },
    earning: {
      j: 1.25,
      c: 1.25,
      d: 1.25,
      r: 1.0,
      i: 1.0,

      y: 1.0,
      b: 1.0,
      h: 1.0,

      v: 0.5,
      l: 0.5,
      n: 0.5,
      s: 0.5,
      q: 0.5,
      o: 0.5,
      k: 0.5,
      m: 0.5,
      z: 0.5,

      g: 0.25,
    },
  },
  ba: {
    fare_class: {
      f: 'first',
      a: 'first',

      j: 'business',
      c: 'business',
      d: 'business',
      r: 'business',
      i: 'business',

      w: 'economy',
      e: 'economy',
      t: 'economy',

      y: 'economy',
      b: 'economy',
      h: 'economy',

      k: 'economy',
      m: 'economy',

      l: 'economy',
      v: 'economy',
      s: 'economy',
      n: 'economy',
      q: 'economy',
      o: 'economy',
      g: 'economy',
    },
    earning: {
      f: 1.5,
      a: 1.5,

      j: 1.25,
      c: 1.25,
      d: 1.25,
      r: 1.25,
      i: 1.0,

      w: 1.0,
      e: 1.0,
      t: 1.0,

      y: 1.0,
      b: 1.0,
      h: 1.0,

      k: 0.5,
      m: 0.5,

      l: 0.25,
      v: 0.25,
      s: 0.25,
      n: 0.25,
      q: 0.25,
      o: 0.25,
      g: 0.25,
    },
  },
};

export const MALAYSIA_RULE_URLS = {
  aa: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/american-airlines.html',
  ay: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/finnair.html',
  ba: 'https://enrich.malaysiaairlines.com/enrich/partners/airlines/oneworld-alliances/british-airways.html',
};
