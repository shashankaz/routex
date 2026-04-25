// utils/distance.ts
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
};