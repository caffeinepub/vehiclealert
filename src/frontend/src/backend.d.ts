import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VehicleUpdate {
    expiryDates?: Expiry;
    model?: string;
    vehicleType?: Type;
    registration?: string;
    name?: string;
}
export type Time = bigint;
export interface Expiry {
    service: Time;
    roadTax: Time;
    insurance: Time;
    pollution: Time;
}
export interface VehicleInput {
    expiryDates: Expiry;
    model: string;
    vehicleType: Type;
    registration: string;
    name: string;
}
export interface Document {
    service?: ExternalBlob;
    registration?: ExternalBlob;
    insurance?: ExternalBlob;
    pollution?: ExternalBlob;
}
export interface Vehicle {
    expiryDates: Expiry;
    model: string;
    vehicleType: Type;
    documents: Document;
    owner: Principal;
    registration: string;
    name: string;
}
export enum Type {
    bus = "bus",
    car = "car",
    truck = "truck",
    other = "other",
    bike = "bike"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVehicle(vehicleInput: VehicleInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteVehicle(licensePlate: string): Promise<void>;
    getAllVehicles(): Promise<Array<Vehicle>>;
    getAllVehiclesByOwner(owner: Principal): Promise<Array<Vehicle>>;
    getCallerUserRole(): Promise<UserRole>;
    getExpiringIn(days: bigint): Promise<Array<Vehicle>>;
    getVehicle(licensePlate: string): Promise<Vehicle>;
    isCallerAdmin(): Promise<boolean>;
    updateVehicle(licensePlate: string, vehicleUpdate: VehicleUpdate): Promise<void>;
    updateVehicleDocuments(licensePlate: string, newDocuments: Document): Promise<void>;
}
