export const splitColorCode = (colorCode: string) => {
  const res = [];
  res[0] = parseInt(colorCode.slice(1, 3), 16);
  res[1] = parseInt(colorCode.slice(3, 5), 16);
  res[2] = parseInt(colorCode.slice(5, 7), 16);
  return res;
};
