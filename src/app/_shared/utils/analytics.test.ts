import posthog from 'posthog-js';
import { trackCalculationCompleted, trackQantasApiMismatch } from '@/app/_shared/utils/analytics';
import { Segment } from '@/app/_shared/models/segment';
import type { Airport } from '@/types/airport';

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
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
        { iata: 'SYD', city: 'Sydney' } as Airport,
        { iata: 'MEL', city: 'Melbourne' } as Airport,
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

      expect(posthog.capture).toHaveBeenCalledTimes(1);
      expect(posthog.capture).toHaveBeenCalledWith('calculation_completed', {
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
        { iata: 'syd', city: 'Sydney' } as Airport,
        { iata: 'lax', city: 'Los Angeles' } as Airport,
      );
      const seg2 = new Segment(
        'aa',
        'y',
        { iata: 'lax', city: 'Los Angeles' } as Airport,
        { iata: 'jfk', city: 'New York' } as Airport,
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

      expect(posthog.capture).toHaveBeenCalledWith('calculation_completed', {
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
          segmentResults: [{ segment: {} as Segment, airlinePoints: 0, elitePoints: 0 }],
          tripType: 'one way',
          eliteStatus: 'Bronze',
        });
      }).not.toThrow();

      expect(posthog.capture).toHaveBeenCalledWith(
        'calculation_completed',
        expect.objectContaining({
          route: '',
          airports: '',
          airlines: '',
          segment_count: 1,
        }),
      );
    });

    it('catches synchronous errors from posthog.capture()', () => {
      (posthog.capture as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Analytics blocked');
      });

      expect(() => {
        trackCalculationCompleted({
          segmentResults: [],
        });
      }).not.toThrow();
    });

    it('truncates property strings exceeding 255 characters', () => {
      const longSegments = Array.from({ length: 60 }, (_, i) => ({
        segment: new Segment(
          'qf',
          'y',
          { iata: `S${String(i).padStart(2, '0')}`, city: 'City A' } as Airport,
          { iata: `D${String(i).padStart(2, '0')}`, city: 'City B' } as Airport,
        ),
        airlinePoints: 100,
        elitePoints: 10,
      }));

      trackCalculationCompleted({
        segmentResults: longSegments,
      });

      expect(posthog.capture).toHaveBeenCalledTimes(1);
      const callProps = (posthog.capture as jest.Mock).mock.calls[0][1];
      expect(callProps.route.length).toBeLessThanOrEqual(255);
      expect(callProps.airports.length).toBeLessThanOrEqual(255);
    });

    it('handles being called with no arguments', () => {
      expect(() => {
        trackCalculationCompleted();
      }).not.toThrow();

      expect(posthog.capture).toHaveBeenCalledWith('calculation_completed', {
        route: '',
        airports: '',
        airlines: '',
        trip_type: '',
        elite_status: '',
        segment_count: 0,
        total_points: 0,
        total_status_credits: 0,
        compare_with_qantas: false,
        contains_errors: false,
      });
    });
  });

  describe('trackQantasApiMismatch', () => {
    it('dispatches qantas_api_mismatch with uppercase segment details and numeric values', () => {
      const segment = new Segment(
        'ca',
        'y',
        { iata: 'pvg', city: 'Shanghai' } as Airport,
        { iata: 'szx', city: 'Shenzhen' } as Airport,
      );

      trackQantasApiMismatch({
        segment,
        ourPoints: 800,
        ourStatusCredits: 10,
        qantasPoints: 0,
        qantasStatusCredits: 0,
        qantasError: null,
        eliteStatus: 'Bronze',
        tripType: 'one way',
      });

      expect(posthog.capture).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: 'PVG-SZX',
        airline: 'CA',
        fare_class: 'Y',
        elite_status: 'Bronze',
        trip_type: 'one way',
        our_points: 800,
        our_status_credits: 10,
        qantas_points: 0,
        qantas_status_credits: 0,
        qantas_error: null,
      });
    });

    it('dispatches qantas_api_mismatch with qantas_error when Qantas API errors', () => {
      const segment = new Segment(
        'ca',
        'y',
        { iata: 'pvg', city: 'Shanghai' } as Airport,
        { iata: 'szx', city: 'Shenzhen' } as Airport,
      );

      trackQantasApiMismatch({
        segment,
        ourPoints: 800,
        ourStatusCredits: 10,
        qantasPoints: null,
        qantasStatusCredits: null,
        qantasError: 'Failed to find a matching Qantas API result',
        eliteStatus: 'Gold',
        tripType: 'one way',
      });

      expect(posthog.capture).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: 'PVG-SZX',
        airline: 'CA',
        fare_class: 'Y',
        elite_status: 'Gold',
        trip_type: 'one way',
        our_points: 800,
        our_status_credits: 10,
        qantas_points: null,
        qantas_status_credits: null,
        qantas_error: 'Failed to find a matching Qantas API result',
      });
    });

    it('passes through exact points and status credits values', () => {
      const segment = new Segment(
        'qf',
        'y',
        { iata: 'SYD' } as Airport,
        { iata: 'MEL' } as Airport,
      );

      trackQantasApiMismatch({
        segment,
        ourPoints: 1200,
        ourStatusCredits: 40,
        qantasPoints: 1000,
        qantasStatusCredits: 30,
        eliteStatus: 'Silver',
        tripType: 'one way',
      });

      expect(posthog.capture).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: 'SYD-MEL',
        airline: 'QF',
        fare_class: 'Y',
        elite_status: 'Silver',
        trip_type: 'one way',
        our_points: 1200,
        our_status_credits: 40,
        qantas_points: 1000,
        qantas_status_credits: 30,
        qantas_error: null,
      });
    });

    it('handles missing segment airport information gracefully', () => {
      expect(() => {
        trackQantasApiMismatch({
          segment: { airline: 'qf', fareClass: 'k' } as Segment,
          ourPoints: 100,
          ourStatusCredits: 10,
          qantasPoints: 120,
          qantasStatusCredits: 10,
          eliteStatus: 'Platinum',
          tripType: 'return',
        });
      }).not.toThrow();

      expect(posthog.capture).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: '',
        airline: 'QF',
        fare_class: 'K',
        elite_status: 'Platinum',
        trip_type: 'return',
        our_points: 100,
        our_status_credits: 10,
        qantas_points: 120,
        qantas_status_credits: 10,
        qantas_error: null,
      });
    });

    it('handles being called with no arguments', () => {
      expect(() => {
        trackQantasApiMismatch();
      }).not.toThrow();

      expect(posthog.capture).toHaveBeenCalledWith('qantas_api_mismatch', {
        route: '',
        airline: '',
        fare_class: '',
        elite_status: '',
        trip_type: '',
        our_points: 0,
        our_status_credits: 0,
        qantas_points: null,
        qantas_status_credits: null,
        qantas_error: null,
      });
    });
  });
});
