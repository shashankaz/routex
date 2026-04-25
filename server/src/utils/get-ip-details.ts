interface IPDetails {
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  lat: string | null;
  lon: string | null;
}

const EMPTY_IP_DETAILS: IPDetails = {
  city: null,
  region: null,
  country: null,
  isp: null,
  lat: null,
  lon: null,
};

export const getIPDetails = async (ipAddress: string): Promise<IPDetails> => {
  if (!ipAddress) return EMPTY_IP_DETAILS;

  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
    const data = await response.json();

    if (data.status === "fail") {
      console.warn("IP lookup failed:", data.message);
      return EMPTY_IP_DETAILS;
    }

    return {
      city: data.city ?? null,
      region: data.regionName ?? null,
      country: data.country ?? null,
      isp: data.isp ?? null,
      lat: data.lat != null ? String(data.lat) : null,
      lon: data.lon != null ? String(data.lon) : null,
    };
  } catch (error) {
    console.error("Error fetching IP details:", error);
    return EMPTY_IP_DETAILS;
  }
};
