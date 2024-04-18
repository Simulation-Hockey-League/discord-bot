export const pluralize = (
  number: number | undefined,
  root: string,
  suffix = 's',
) => `${root}${number !== 1 ? suffix : ''}`;

export const suffix = (i: number) => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
};

export const hexColorToInt = (hex: string) =>
  parseInt(hex.replace(/^#/, ''), 16);
