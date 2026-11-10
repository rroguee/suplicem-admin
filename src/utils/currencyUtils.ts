export const formatRD = (amount: number): string => {
  const formatted = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `RD$ ${formatted}`;
};
