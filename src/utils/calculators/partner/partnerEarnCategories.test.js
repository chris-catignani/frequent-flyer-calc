import { getPartnerEarnCategory } from './partnerEarnCategories';
import { buildSegmentFromString } from '@/test/testUtils';

describe('getPartnerEarnCategory', () => {
  // basic case
  test.each([
    ['n', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],

    ['g', 'economy'],
    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],

    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['p', 'premiumEconomy'],
    ['w', 'premiumEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],
    ['r', 'business'],

    ['a', 'first'],
    ['f', 'first'],
  ])(
    'recognizes the American Airlines %s fareclass is a %s categories',
    (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`aa ${fareClass} jfk lax`);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    },
  );

  // alaska has a special character in the Qantas website
  test.each([
    ['g', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],
    ['x', 'discountEconomy'],

    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['n', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],

    ['a', 'first'],
    ['f', 'first'],
  ])(
    'recognizes the Alaska Airline %s fareclass is a %s categories',
    (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`as ${fareClass} jfk lax`);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    },
  );

  // Qatar does not have Premium Economy
  test.each([
    ['k', 'discountEconomy'],
    ['l', 'discountEconomy'],
    ['m', 'discountEconomy'],
    ['v', 'discountEconomy'],

    ['b', 'economy'],
    ['h', 'economy'],

    ['y', 'flexibleEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],
    ['p', 'business'],
    ['r', 'business'],

    ['a', 'first'],
    ['f', 'first'],
  ])(
    'recognizes the Qatar Airlines %s fareclass is a %s categories',
    (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`qr ${fareClass} jfk lax`);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    },
  );

  describe('Japan Airlines special cases', () => {
    test.each([
      ['DiscountEconomy', 'economy'],
      ['DiscountEconomyplusPremiumSurcharge', 'economy'],

      ['Economy', 'flexibleEconomy'],
      ['DiscountEconomyplusFirstSurcharge', 'flexibleEconomy'],

      ['EconomyplusPremiumSurcharge', 'premiumEconomy'],

      ['EconomyplusFirstSurcharge', 'first'],
    ])('recognizes the JAL (jl) %s fareclass is a %s categories', (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`jl ${fareClass} hnd cts`);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['DiscountEconomy', 'economy'],
      ['DiscountEconomyplusPremiumSurcharge', 'economy'],

      ['Economy', 'flexibleEconomy'],
      ['DiscountEconomyplusFirstSurcharge', 'flexibleEconomy'],

      ['EconomyplusPremiumSurcharge', 'premiumEconomy'],

      ['EconomyplusFirstSurcharge', 'first'],
    ])('recognizes the JAL (nu) %s fareclass is a %s categories', (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`nu ${fareClass} hnd cts`);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test('non intra-Japan flights succeed', () => {
      const segment = buildSegmentFromString(`jl i hnd tpe`);
      expect(getPartnerEarnCategory(segment)).toBe('business');
    });
  });

  describe('Malaysia Airlines special cases', () => {
    test.each([
      ['mh j kul syd', 'flexibleEconomy'],
      ['mh j syd kul', 'flexibleEconomy'],
      ['mh j kul lhr', 'flexibleEconomy'],
      ['mh j lhr kul', 'flexibleEconomy'],
      ['mh j kul cdg', 'flexibleEconomy'],
      ['mh j cdg kul', 'flexibleEconomy'],
    ])(
      'Flights between Australia and Malaysia, UK or Europe',
      (segmentString, expectedCategory) => {
        const segment = buildSegmentFromString(segmentString);
        expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
      },
    );

    test.each([
      ['mh j kul akl', 'flexibleEconomy'],
      ['mh j akl kul', 'flexibleEconomy'],
      ['mh j akl lhr', 'flexibleEconomy'],
      ['mh j lhr akl', 'flexibleEconomy'],
      ['mh j akl cdg', 'flexibleEconomy'],
      ['mh j cdg akl', 'flexibleEconomy'],
    ])(
      'Flights between New Zealand and Malaysia, UK or Europe',
      (segmentString, expectedCategory) => {
        const segment = buildSegmentFromString(segmentString);
        expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
      },
    );

    test.each([
      ['mh j kul lhr', 'flexibleEconomy'],
      ['mh j lhr kul', 'flexibleEconomy'],
      ['mh j kul cdg', 'flexibleEconomy'],
      ['mh j cdg kul', 'flexibleEconomy'],
      ['mh j kul doh', 'flexibleEconomy'],
      ['mh j doh kul', 'flexibleEconomy'],
    ])(
      'Flights between Malaysia and UK, Europe or Middle East',
      (segmentString, expectedCategory) => {
        const segment = buildSegmentFromString(segmentString);
        expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
      },
    );

    test.each([
      ['mh j kul tpe', 'business'],
      ['mh j tpe kul', 'business'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('SriLanka Airlines special cases', () => {
    test.each([
      ['ul p syd kul', 'economy'],
      ['ul p kul syd', 'economy'],
      ['ul p syd cmb', 'economy'],
      ['ul p cmb syd', 'economy'],
      ['ul p per kul', 'flexibleEconomy'],
      ['ul p kul per', 'flexibleEconomy'],
    ])(
      'Flights between Southeast Australia and Malaysia or Sri Lanka',
      (segmentString, expectedCategory) => {
        const segment = buildSegmentFromString(segmentString);
        expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
      },
    );

    test.each([
      ['ul p cdg kul', 'economy'],
      ['ul p kul cdg', 'economy'],
      ['ul p ist kul', 'economy'],
      ['ul p kul ist', 'economy'],
      ['ul p cdg cmb', 'economy'],
      ['ul p cmb cdg', 'economy'],
      ['ul p ist cmb', 'economy'],
      ['ul p cmb ist', 'economy'],
    ])('Flights between Europe and Malaysia or Sri Lanka', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['ul p doh cmb', 'flexibleEconomy'],
      ['ul p cmb doh', 'flexibleEconomy'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('Air France special cases', () => {
    test.each([
      ['af r cdg ory', 'discountEconomy'],
      ['af r ory cdg', 'discountEconomy'],
      ['af a cdg ory', 'flexibleEconomy'],
      ['af a ory cdg', 'flexibleEconomy'],
    ])('Domestic flights within France', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['af r cdg mad', 'discountEconomy'],
      ['af r mad cdg', 'discountEconomy'],
      ['af a cdg mad', 'economy'],
      ['af a mad cdg', 'economy'],
      ['af i cdg mad', 'business'],
      ['af i mad cdg', 'business'],
      ['af a cdg waw', 'economy'],
      ['af a waw cdg', 'economy'],
    ])(
      'Flights Intra Europe or flights between Europe and other European-esc countries',
      (segmentString, expectedCategory) => {
        const segment = buildSegmentFromString(segmentString);
        expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
      },
    );

    test.each([
      ['af a cdg jfk', 'premiumEconomy'],
      ['af a jfk cdg', 'premiumEconomy'],
      ['af i cdg jfk', 'business'],
      ['af i jfk cdg', 'business'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('China Eastern special cases', () => {
    test.each([
      ['mu h pvg szx', 'discountEconomy'],
      ['mu h szx pvg', 'discountEconomy'],
      ['mu y pvg szx', 'flexibleEconomy'],
      ['mu y szx pvg', 'flexibleEconomy'],
      ['mu i pvg szx', 'business'],
      ['mu i szx pvg', 'business'],
      ['mu u pvg szx', 'first'],
      ['mu u szx pvg', 'first'],
    ])('Domestic flights within France', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['mu z pvg jfk', 'discountEconomy'],
      ['mu z jfk pvg', 'discountEconomy'],
      ['mu y pvg jfk', 'flexibleEconomy'],
      ['mu y jfk pvg', 'flexibleEconomy'],
      ['mu i pvg jfk', 'business'],
      ['mu i jfk pvg', 'business'],
      ['mu u pvg jfk', 'first'],
      ['mu u jfk pvg', 'first'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('China Eastern special cases', () => {
    test.each([
      ['mu h pvg szx', 'discountEconomy'],
      ['mu h szx pvg', 'discountEconomy'],
      ['mu y pvg szx', 'flexibleEconomy'],
      ['mu y szx pvg', 'flexibleEconomy'],
      ['mu i pvg szx', 'business'],
      ['mu i szx pvg', 'business'],
      ['mu u pvg szx', 'first'],
      ['mu u szx pvg', 'first'],
    ])('Domestic flights within France', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['mu z pvg jfk', 'discountEconomy'],
      ['mu z jfk pvg', 'discountEconomy'],
      ['mu y pvg jfk', 'flexibleEconomy'],
      ['mu y jfk pvg', 'flexibleEconomy'],
      ['mu i pvg jfk', 'business'],
      ['mu i jfk pvg', 'business'],
      ['mu u pvg jfk', 'first'],
      ['mu u jfk pvg', 'first'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('Fiji Airways special cases', () => {
    test.each([
      ['fj h nan lbs', 'flexibleEconomy'],
      ['fj h lbs nan', 'flexibleEconomy'],
      ['fj l nan lbs', 'flexibleEconomy'],
      ['fj l lbs nan', 'flexibleEconomy'],
      ['fj y nan lbs', 'flexibleEconomy'],
      ['fj y lbs nan', 'flexibleEconomy'],
    ])('Domestic flights within Fiji', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });

    test.each([
      ['fj g nan syd', 'discountEconomy'],
      ['fj g syd nan', 'discountEconomy'],
      ['fj l nan syd', 'economy'],
      ['fj l syd nan', 'economy'],
      ['fj i nan syd', 'business'],
      ['fj i syd nan', 'business'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString);
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory);
    });
  });

  describe('Edge cases', () => {
    test('invalid airline code', () => {
      const segment = buildSegmentFromString(`xx i hnd cts`);
      expect(() => getPartnerEarnCategory(segment)).toThrow('No airline configured for xx');
    });

    test('invalid fare code', () => {
      const segment = buildSegmentFromString(`aa x hnd cts`);
      expect(() => getPartnerEarnCategory(segment)).toThrow(
        'Airline aa is not configured for fare class x',
      );
    });
  });
});
