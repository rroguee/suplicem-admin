export const AVAILABLE_LOTS = Array.from({ length: 20 }, (_, i) => (i + 1) * 50);

export const formatNumberInput = (raw: string | number): string => {
  if (raw === undefined || raw === null || raw === "") return "";
  const cleaned = String(raw).replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const intRaw = parts[0].replace(/^0+(?=\d)/, "");
  const intFormatted = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (parts.length > 1) {
    const decPart = parts[1].slice(0, 2);
    return `${intFormatted}.${decPart}`;
  }
  return intFormatted;
};

export const parseFormattedNumber = (val: string | number | undefined): number => {
  if (val === undefined || val === null || val === "") return 0;
  const num = parseFloat(String(val).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};
