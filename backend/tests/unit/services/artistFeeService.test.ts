import { computeArtistFee } from "@src/services/pricing/artistFeeService";
import {
  ARTIST_MULTIPLIERS_LARGE,
  ARTIST_MULTIPLIERS_SMALL,
  ArtistLevel,
  ArtistSetType,
  CAP_MULTIPLIER_LARGE,
  CAP_MULTIPLIER_SMALL,
  FLOOR_MULTIPLIER_LARGE,
  FLOOR_MULTIPLIER_SMALL,
} from "@src/services/pricing/pricingConstants";

describe("computeArtistFee", () => {
  describe("small capacity (< 2000)", () => {
    const baseInput = {
      capacity: 500,
      ticketPrice: 15,
      setType: ArtistSetType.DJ,
    };

    it.each(Object.values(ArtistLevel))(
      "uses small multiplier for level %s with DJ set",
      (level) => {
        const result = computeArtistFee({ ...baseInput, level });
        expect(result.multiplier).toBe(ARTIST_MULTIPLIERS_SMALL[level]);
        expect(result.recommended).toBe(
          ARTIST_MULTIPLIERS_SMALL[level] * baseInput.ticketPrice,
        );
      },
    );

    it("applies the floor and cap multipliers", () => {
      const result = computeArtistFee({
        ...baseInput,
        level: ArtistLevel.L2,
      });
      expect(result.range).toEqual([
        FLOOR_MULTIPLIER_SMALL * baseInput.ticketPrice,
        CAP_MULTIPLIER_SMALL * baseInput.ticketPrice,
      ]);
    });
  });

  describe("large capacity (>= 2000)", () => {
    const baseInput = {
      capacity: 2500,
      ticketPrice: 25,
      setType: ArtistSetType.DJ,
    };

    it.each(Object.values(ArtistLevel))(
      "uses large multiplier for level %s with DJ set",
      (level) => {
        const result = computeArtistFee({ ...baseInput, level });
        expect(result.multiplier).toBe(ARTIST_MULTIPLIERS_LARGE[level]);
      },
    );

    it("applies large floor/cap multipliers", () => {
      const result = computeArtistFee({
        ...baseInput,
        level: ArtistLevel.L4,
      });
      expect(result.range).toEqual([
        FLOOR_MULTIPLIER_LARGE * baseInput.ticketPrice,
        CAP_MULTIPLIER_LARGE * baseInput.ticketPrice,
      ]);
    });
  });

  describe("set-type uplift", () => {
    const baseInput = {
      capacity: 1000,
      ticketPrice: 20,
      level: ArtistLevel.L3,
    };

    it("applies hybrid uplift of 1.10 to the multiplier", () => {
      const result = computeArtistFee({
        ...baseInput,
        setType: ArtistSetType.HYBRID,
      });
      expect(result.multiplier).toBe(
        Math.round(ARTIST_MULTIPLIERS_SMALL[ArtistLevel.L3] * 1.1),
      );
      expect(result.recommended).toBe(
        result.multiplier * baseInput.ticketPrice,
      );
    });

    it("applies live uplift of 1.15 to the multiplier", () => {
      const result = computeArtistFee({
        ...baseInput,
        setType: ArtistSetType.LIVE,
      });
      expect(result.multiplier).toBe(
        Math.round(ARTIST_MULTIPLIERS_SMALL[ArtistLevel.L3] * 1.15),
      );
    });
  });

  describe("spec sample values", () => {
    it("matches the cap-500 / ticket-15 / L2 / DJ case", () => {
      const result = computeArtistFee({
        capacity: 500,
        ticketPrice: 15,
        level: ArtistLevel.L2,
        setType: ArtistSetType.DJ,
      });
      expect(result.multiplier).toBe(30);
      expect(result.recommended).toBe(450);
      expect(result.range).toEqual([300, 750]);
    });

    it("matches the cap-1000 / ticket-20 / L3 / hybrid case", () => {
      const result = computeArtistFee({
        capacity: 1000,
        ticketPrice: 20,
        level: ArtistLevel.L3,
        setType: ArtistSetType.HYBRID,
      });
      expect(result.multiplier).toBe(44);
      expect(result.recommended).toBe(880);
      expect(result.range).toEqual([400, 1000]);
    });

    it("matches the cap-2500 / ticket-25 / L4 / live case", () => {
      const result = computeArtistFee({
        capacity: 2500,
        ticketPrice: 25,
        level: ArtistLevel.L4,
        setType: ArtistSetType.LIVE,
      });
      expect(result.multiplier).toBe(69);
      expect(result.recommended).toBe(1725);
      expect(result.range).toEqual([750, 1500]);
    });
  });

  describe("edge cases", () => {
    it("returns pctGross = 0 when capacity is 0", () => {
      const result = computeArtistFee({
        capacity: 0,
        ticketPrice: 20,
        level: ArtistLevel.L2,
        setType: ArtistSetType.DJ,
      });
      expect(result.pctGross).toBe(0);
      expect(result.gross).toBe(0);
    });

    it("returns pctGross = 0 when ticketPrice is 0", () => {
      const result = computeArtistFee({
        capacity: 500,
        ticketPrice: 0,
        level: ArtistLevel.L1,
        setType: ArtistSetType.LIVE,
      });
      expect(result.pctGross).toBe(0);
      expect(result.gross).toBe(0);
      expect(result.recommended).toBe(0);
    });

    it("computes pctGross as recommended / gross when both are positive", () => {
      const result = computeArtistFee({
        capacity: 1000,
        ticketPrice: 20,
        level: ArtistLevel.L3,
        setType: ArtistSetType.HYBRID,
      });
      // recommended = 880, gross = 20 000 → 4.4%
      expect(result.gross).toBe(20_000);
      expect(result.pctGross).toBeCloseTo(880 / 20000, 6);
    });
  });
});
