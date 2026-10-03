import { allocateByWeight } from "@/calculators/atmos/allocate";

describe("allocateByWeight", () => {
  it("splits proportionally and sums exactly to the total", () => {
    // 2500 × 954/3423 = 696.76…, 2500 × 2469/3423 = 1803.24…
    expect(allocateByWeight(2500, [954, 2469])).toEqual([697, 1803]);
  });

  it("gives remainders to the largest fractions, earliest first on ties", () => {
    expect(allocateByWeight(10, [1, 1, 1])).toEqual([4, 3, 3]);
  });

  it("splits equally when all weights are zero", () => {
    expect(allocateByWeight(5, [0, 0])).toEqual([3, 2]);
  });

  it("handles empty input and zero totals", () => {
    expect(allocateByWeight(100, [])).toEqual([]);
    expect(allocateByWeight(0, [10, 20])).toEqual([0, 0]);
  });
});
