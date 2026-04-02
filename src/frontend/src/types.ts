export enum VehicleType {
  car = "car",
  bike = "bike",
  truck = "truck",
  bus = "bus",
  other = "other",
}

export interface ExpiryDates {
  roadTax: number;
  insurance: number;
  pollution: number;
  service: number;
}

export interface Vehicle {
  id: string;
  name: string;
  registration: string;
  model: string;
  vehicleType: VehicleType;
  expiryDates: ExpiryDates;
}
