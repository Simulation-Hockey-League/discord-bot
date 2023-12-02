export const pluralize = (count: number, text: string, suffix = 's') =>
  `${text}${count !== 1 ? suffix : ''}`;
