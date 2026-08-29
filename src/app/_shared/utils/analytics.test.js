import { track } from '@vercel/analytics';
import { trackCalculationCompleted, trackQantasApiMismatch } from '@/app/_shared/utils/analytics';
import { Segment } from '@/app/_shared/models/segment';

jest.mock('@vercel/analytics', () => ({
  track: jest.fn(),
}));

describe('analytics utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackCalculationCompleted', () => {
    it('dispatches calculation_completed with normalized properties for a single segment', () => {
      const segment = new Segment(
        'qf',
        'y',
        { iata: 'SYD', city: 'Sydney' },
        { iata: 'MEL', city: 'Melbourne' },
      );

      trackCalculationCompleted({
        segmentResults: [{ segment, airlinePoints: 800, elitePoints: 10 }],
        tripType: 'one way',
        eliteStatus: 'Gold',
        compareWithQantas: false,
        containsErrors: false,
        totalPoints: 800,
        totalStatusCredits: 10,
      });

      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith('calculation_completed', {
        route: 'SYD-MEL',
        airports: 'SYD, MEL',
        airlines: 'QF',
        trip_type: 'one way',
        elite_status: 'Gold',
        segment_count: 1,
        total_points: 800,
        total_status_credits: 10,
        compare_with_qantas: false,
        contains_errors: false,
      });
    });

    it('handles multi-segment return itineraries and normalizes casing', () => {
      const seg1 = new Segment(
        'qf',
        'j',
        { iata: 'syd', city: 'Sydney' },
        { iata: 'lax', city: 'Los Angeles' },
      );
      const seg2 = new Segment(
        'aa',
        'y',
        { iata: 'lax', city: 'Los Angeles' },
        { iata: 'jfk', city: 'New York' },
      );

      trackCalculationCompleted({
        segmentResults: [
          { segment: seg1, airlinePoints: 4500, elitePoints: 90 },
          { segment: seg2, airlinePoints: 1400, elitePoints: 30 },
        ],
        tripType: 'return',
        eliteStatus: 'Platinum',
        compareWithQantas: true,
        containsErrors: false,
        totalPoints: 5900,
        totalStatusCredits: 120,
      });

      expect(track).toHaveBeenCalledWith('calculation_completed', {
        route: 'SYD-LAX, LAX-JFK',
        airports: 'SYD, LAX, JFK',
        airlines: 'QF, AA',
        trip_type: 'return',
        elite_status: 'Platinum',
        segment_count: 2,
        total_points: 5900,
        total_status_credits: 120,
        compare_with_qantas: true,
        contains_errors: false,
      });
    });

    it('safely handles missing airports or empty segment results without throwing', () => {
      expect(() => {
        trackCalculationCompleted({
          segmentResults: [{ segment: {}, airlinePoints: 0, elitePoints: 0 }],
          tripType: 'one way',
          eliteStatus: 'Bronze',
        });
      }).not.toThrow();

      expect(track).toHaveBeenCalledWith(
        'calculation_completed',
        expect.objectContaining({
          route: '',
          airports: '',
          airlines: '',
          segment_count: 1,
        }),
      );
    });

    it('catches synchronous errors and rejected promises from track()', () => {
      track.mockImplementationOnce(() => {
        throw new Error('Analytics blocked');
      });

      expect(() => {
        trackCalculationCompleted({
          segmentResults: [],
        });
      }).not.toThrow();
    });

    it('handles being called with no arguments', () => {
      expect(() => {
        trackCalculationCompleted();
      }).not.toThrow();

      expect(track).toHaveBeenCalledWith('calculation_completed', {
        route: '',
        airports: '',
        airlines: '',
        trip_type: 'one way',
        elite_status: 'Bronze',
        segment_count: 0,
        total_points: 0,
        total_status_credits: 0,
        compare_with_qantas: false,
        contains_errors: false,
      });
    });
  });

  describe('trackQantasApiMismatch', () => {
    it('dispatches qantas_api_mismatch with uppercase segment details', () => {
      const segment = new Segment(
        'ca',
        'y',
        { iata: 'pvg', city: 'Shanghai' },
        { iata: 'szx', city: 'Shenzhen' },
      );

      trackQantasApiMismatch({
        segment,
        ourPoints: 800,
        ourStatusCredits: 10,
        qantasPoints: 0,
        qantasStatusCredits: 0,
        eliteStatus: 'Bronze',
        tripType: 'one way',
      });

      expect(track).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: 'PVG-SZX',
        airline: 'CA',
        fare_class: 'Y',
        elite_status: 'Bronze',
        trip_type: 'one way',
        our_points: 800,
        our_status_credits: 10,
        qantas_points: 0,
        qantas_status_credits: 0,
      });
    });

    it('handles missing segment airport information gracefully', () => {
      expect(() => {
        trackQantasApiMismatch({
          segment: { airline: 'qf', fareClass: 'k' },
          ourPoints: 100,
          ourStatusCredits: 10,
          qantasPoints: 120,
          qantasStatusCredits: 10,
        });
      }).not.toThrow();

      expect(track).toHaveBeenCalledWith(
        'qantas_api_mismatch',
        expect.objectContaining({
          route: '',
          airline: 'QF',
          fare_class: 'K',
        }),
      );
    });

    it('handles being called with no arguments', () => {
      expect(() => {
        trackQantasApiMismatch();
      }).not.toThrow();

      expect(track).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: '',
        airline: '',
        fare_class: '',
        elite_status: 'Bronze',
        trip_type: 'one way',
        our_points: 0,
        our_status_credits: 0,
        qantas_points: 0,
        qantas_status_credits: 0,
      });
    });
  });
});
