import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAddVehicle, useUpdateVehicle } from "../hooks/useQueries";
import { VehicleType } from "../types";
import type { Vehicle } from "../types";

function tsToDateString(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

function dateStringToTs(s: string): number {
  return new Date(s).getTime();
}

interface AddVehicleModalProps {
  open: boolean;
  onClose: () => void;
  editVehicle?: Vehicle | null;
}

const defaultForm = {
  name: "",
  registration: "",
  model: "",
  vehicleType: VehicleType.car as VehicleType,
  roadTax: "",
  insurance: "",
  pollution: "",
  service: "",
};

export default function AddVehicleModal({
  open,
  onClose,
  editVehicle,
}: AddVehicleModalProps) {
  const [form, setForm] = useState(defaultForm);
  const addMutation = useAddVehicle();
  const updateMutation = useUpdateVehicle();
  const isPending = addMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editVehicle) {
      setForm({
        name: editVehicle.name,
        registration: editVehicle.registration,
        model: editVehicle.model,
        vehicleType: editVehicle.vehicleType,
        roadTax: tsToDateString(editVehicle.expiryDates.roadTax),
        insurance: tsToDateString(editVehicle.expiryDates.insurance),
        pollution: tsToDateString(editVehicle.expiryDates.pollution),
        service: tsToDateString(editVehicle.expiryDates.service),
      });
    } else {
      setForm(defaultForm);
    }
  }, [editVehicle]);

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.registration ||
      !form.model ||
      !form.roadTax ||
      !form.insurance ||
      !form.pollution ||
      !form.service
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    const expiryDates = {
      roadTax: dateStringToTs(form.roadTax),
      insurance: dateStringToTs(form.insurance),
      pollution: dateStringToTs(form.pollution),
      service: dateStringToTs(form.service),
    };
    try {
      if (editVehicle) {
        await updateMutation.mutateAsync({
          licensePlate: editVehicle.registration,
          update: {
            name: form.name,
            model: form.model,
            vehicleType: form.vehicleType,
            expiryDates,
          },
        });
        toast.success("Vehicle updated!");
      } else {
        await addMutation.mutateAsync({
          name: form.name,
          registration: form.registration,
          model: form.model,
          vehicleType: form.vehicleType,
          expiryDates,
        });
        toast.success("Vehicle added!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const set = (k: keyof typeof defaultForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="vehicle.dialog"
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>
          <DialogDescription>
            Enter your vehicle details and expiry dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="v-name">Vehicle Name</Label>
              <Input
                id="v-name"
                data-ocid="vehicle.name.input"
                placeholder="e.g. Honda City"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-reg">Registration Number</Label>
              <Input
                id="v-reg"
                data-ocid="vehicle.registration.input"
                placeholder="e.g. MH01AB1234"
                value={form.registration}
                onChange={(e) => set("registration", e.target.value)}
                disabled={!!editVehicle}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-model">Model</Label>
              <Input
                id="v-model"
                data-ocid="vehicle.model.input"
                placeholder="e.g. Honda City ZX"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-type">Vehicle Type</Label>
              <Select
                value={form.vehicleType}
                onValueChange={(v) => set("vehicleType", v)}
              >
                <SelectTrigger id="v-type" data-ocid="vehicle.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VehicleType.car}>🚗 Car</SelectItem>
                  <SelectItem value={VehicleType.bike}>🏍️ Bike</SelectItem>
                  <SelectItem value={VehicleType.truck}>🚛 Truck</SelectItem>
                  <SelectItem value={VehicleType.bus}>🚌 Bus</SelectItem>
                  <SelectItem value={VehicleType.other}>🚐 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">
              Expiry Dates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="v-roadtax">🏛️ Road Tax Expiry</Label>
                <Input
                  id="v-roadtax"
                  data-ocid="vehicle.roadtax.input"
                  type="date"
                  value={form.roadTax}
                  onChange={(e) => set("roadTax", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-insurance">🛡️ Insurance Expiry</Label>
                <Input
                  id="v-insurance"
                  data-ocid="vehicle.insurance.input"
                  type="date"
                  value={form.insurance}
                  onChange={(e) => set("insurance", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-puc">🌿 PUC Expiry</Label>
                <Input
                  id="v-puc"
                  data-ocid="vehicle.puc.input"
                  type="date"
                  value={form.pollution}
                  onChange={(e) => set("pollution", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-service">🔧 Service Due Date</Label>
                <Input
                  id="v-service"
                  data-ocid="vehicle.service.input"
                  type="date"
                  value={form.service}
                  onChange={(e) => set("service", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="vehicle.cancel_button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="vehicle.submit_button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary text-primary-foreground"
          >
            {isPending
              ? "Saving..."
              : editVehicle
                ? "Save Changes"
                : "Add Vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
