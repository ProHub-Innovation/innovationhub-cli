export function parseDurationToSeconds(
  value: string | number | undefined,
  defaultSeconds: number,
): number {
  if (value === undefined || value === null) {
    return defaultSeconds;
  }
  if (typeof value === 'number') {
    return value;
  }

  const trimmed = (value || '').toString().trim();
  const match = /^(\d+)\s*(s|m|h|d)?$/i.exec(trimmed);
  if (!match) {
    return defaultSeconds;
  }

  const amount = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      return defaultSeconds;
  }
}
