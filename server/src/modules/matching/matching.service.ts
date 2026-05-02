import { prisma } from "../../utils/db";
import { calculateDistance } from "../../utils/distance";

const MAX_RIDER_DISTANCE_KM = 2;

export const assignNearestRider = async (
  societyId: string,
  customerLat?: number | null,
  customerLng?: number | null,
): Promise<{ id: string } | null> => {
  const riders = await prisma.user.findMany({
    where: {
      role: "RIDER",
      isAvailable: true,
      societyId,
    },
    select: { id: true, lat: true, lng: true },
  });

  if (!riders.length) return null;

  if (customerLat != null && customerLng != null) {
    let nearestRider: { id: string } | null = null;
    let minDistance = Infinity;

    for (const rider of riders) {
      if (rider.lat === null || rider.lng === null) continue;

      const distance = calculateDistance(
        customerLat,
        customerLng,
        rider.lat,
        rider.lng,
      );

      if (distance < minDistance && distance <= MAX_RIDER_DISTANCE_KM) {
        minDistance = distance;
        nearestRider = { id: rider.id };
      }
    }

    return nearestRider;
  }

  const fallback = riders[0];
  return fallback ? { id: fallback.id } : null;
};
