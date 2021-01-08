export const sliceAfterLast = (s: string, delimiter: string): string =>
  s.slice(s.lastIndexOf(delimiter) + 1);

export const sliceBeforeLast = (s: string, delimiter: string): string =>
  s.slice(0, s.lastIndexOf(delimiter));
