import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Vehicle } from "../types";

const STORAGE_KEY = "kochuparambil_vehicles";
const SETTINGS_KEY = "kochuparambil_settings";
const VEHICLES_UPDATED_EVENT = "vehicles-updated";

function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Vehicle[]) : [];
  } catch {
    return [];
  }
}

function saveVehicles(vehicles: Vehicle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  window.dispatchEvent(new CustomEvent(VEHICLES_UPDATED_EVENT));
}

export function useGetAllVehicles() {
  const qc = useQueryClient();

  useEffect(() => {
    const handler = () => qc.invalidateQueries({ queryKey: ["vehicles"] });
    window.addEventListener(VEHICLES_UPDATED_EVENT, handler);
    return () => window.removeEventListener(VEHICLES_UPDATED_EVENT, handler);
  }, [qc]);

  return useQuery({
    queryKey: ["vehicles"],
    queryFn: loadVehicles,
  });
}

export function useAddVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, "id">) => {
      const vehicles = loadVehicles();
      const newVehicle: Vehicle = { ...vehicle, id: vehicle.registration };
      vehicles.push(newVehicle);
      saveVehicles(vehicles);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      licensePlate,
      update,
    }: { licensePlate: string; update: Partial<Vehicle> }) => {
      const vehicles = loadVehicles();
      const idx = vehicles.findIndex((v) => v.registration === licensePlate);
      if (idx >= 0) vehicles[idx] = { ...vehicles[idx], ...update };
      saveVehicles(vehicles);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (licensePlate: string) => {
      const vehicles = loadVehicles().filter(
        (v) => v.registration !== licensePlate,
      );
      saveVehicles(vehicles);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

// Settings helpers
export interface AppSettings {
  day1: boolean;
  day3: boolean;
  day7: boolean;
  day30: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  day1: true,
  day3: true,
  day7: true,
  day30: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as AppSettings) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
