/**
 * Splits an integer total across items in proportion to their weights using the
 * largest-remainder method, so the parts always sum exactly to the total.
 */
export const allocateByWeight = (total: number, weights: number[]): number[] => {
  if (weights.length === 0) {
    return [];
  }

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const effectiveWeights = weightSum > 0 ? weights : weights.map(() => 1);
  const effectiveSum = weightSum > 0 ? weightSum : weights.length;

  const exactShares = effectiveWeights.map((weight) => (total * weight) / effectiveSum);
  const shares = exactShares.map(Math.floor);
  const remainder = total - shares.reduce((sum, share) => sum + share, 0);

  exactShares
    .map((exact, idx) => ({ idx, fraction: exact - shares[idx] }))
    .sort((a, b) => b.fraction - a.fraction || a.idx - b.idx)
    .slice(0, remainder)
    .forEach(({ idx }) => {
      shares[idx] += 1;
    });

  return shares;
};
