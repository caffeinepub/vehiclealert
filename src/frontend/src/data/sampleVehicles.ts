import { VehicleType } from "../types";
import type { Vehicle } from "../types";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: "MH01AB1234",
    name: "Honda City",
    registration: "MH01AB1234",
    model: "Honda City ZX",
    vehicleType: VehicleType.car,
    expiryDates: {
      insurance: now + 5 * DAY,
      roadTax: now + 45 * DAY,
      pollution: now + 12 * DAY,
      service: now + 60 * DAY,
    },
  },
  {
    id: "KA05CD5678",
    name: "Royal Enfield Bullet",
    registration: "KA05CD5678",
    model: "Royal Enfield Bullet 350",
    vehicleType: VehicleType.bike,
    expiryDates: {
      insurance: now + 25 * DAY,
      roadTax: now + 120 * DAY,
      pollution: now + 2 * DAY,
      service: now + 15 * DAY,
    },
  },
  {
    id: "DL09EF9012",
    name: "Tata Ace",
    registration: "DL09EF9012",
    model: "Tata Ace Gold",
    vehicleType: VehicleType.truck,
    expiryDates: {
      insurance: now + 90 * DAY,
      roadTax: now + 3 * DAY,
      pollution: now + 50 * DAY,
      service: now + 7 * DAY,
    },
  },
];
