import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        name: string;
        email: string;
        role: "CHEF" | "RESIDENT" | "RIDER";
        societyId: string;
        isAvailable: boolean | null;
        lat: number | null;
        lng: number | null;
      };
    }
  }
}
