// export const calculateDistance = (
//   lat1: number,
//   lng1: number,
//   lat2: number,
//   lng2: number
// ) => {
//   return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
// };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const RADIUS = 6371.0;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return RADIUS * c;
};
