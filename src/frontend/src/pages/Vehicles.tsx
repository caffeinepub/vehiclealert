import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Car, Edit2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import AddVehicleModal from "../components/AddVehicleModal";
import { SAMPLE_VEHICLES } from "../data/sampleVehicles";
import { useDeleteVehicle, useGetAllVehicles } from "../hooks/useQueries";
import type { Vehicle } from "../types";
import {
  DOC_ICONS,
  DOC_LABELS,
  type DocType,
  getDaysLeft,
  getUrgency,
} from "../utils/urgency";

const DOC_TYPES: DocType[] = ["roadTax", "insurance", "pollution", "service"];

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  car: "🚗",
  bike: "🏍️",
  truck: "🚛",
  bus: "🚌",
  other: "🚐",
};

export default function Vehicles() {
  const { data: storedVehicles = [], isLoading } = useGetAllVehicles();
  const isSample = storedVehicles.length === 0;
  const vehicles = isSample ? SAMPLE_VEHICLES : storedVehicles;
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const deleteMutation = useDeleteVehicle();

  const handleDelete = async (reg: string) => {
    if (isSample) {
      toast.info("This is sample data. Add your vehicles to manage them.");
      return;
    }
    try {
      await deleteMutation.mutateAsync(reg);
      toast.success("Vehicle deleted");
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Vehicles
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage all your registered vehicles
          </p>
        </div>
        <Button
          data-ocid="vehicles.add_vehicle.button"
          onClick={() => {
            setEditVehicle(null);
            setModalOpen(true);
          }}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {isSample && (
        <Badge
          variant="outline"
          className="text-xs text-due-soon border-due-soon/30 bg-due-soon-bg"
        >
          Sample Data — Add your vehicles to get started
        </Badge>
      )}

      {isLoading ? (
        <div
          data-ocid="vehicles.loading_state"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["a", "b", "c"].map((k) => (
            <div key={k} className="bg-card rounded-xl h-56 animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div
          data-ocid="vehicles.empty_state"
          className="bg-card rounded-xl shadow-card p-12 text-center"
        >
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No vehicles yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add your first vehicle to start tracking expiry dates.
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {vehicles.map((v, idx) => (
              <motion.div
                key={v.registration}
                data-ocid={`vehicles.item.${idx + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-5 space-y-4"
              >
                {/* Vehicle header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                      {VEHICLE_TYPE_ICONS[v.vehicleType] || "🚗"}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">
                        {v.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.registration} ·{" "}
                        <span className="capitalize">{v.model}</span>
                      </div>
                    </div>
                  </div>
                  {!isSample && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 text-muted-foreground hover:text-primary"
                        data-ocid={`vehicles.edit_button.${idx + 1}`}
                        onClick={() => {
                          setEditVehicle(v);
                          setModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                            data-ocid={`vehicles.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="vehicles.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete {v.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the vehicle and all
                              its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="vehicles.delete.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="vehicles.delete.confirm_button"
                              onClick={() => handleDelete(v.registration)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {/* Expiry dates grid */}
                <div className="grid grid-cols-2 gap-2">
                  {DOC_TYPES.map((dt) => {
                    const t = v.expiryDates[dt];
                    const daysLeft = getDaysLeft(t);
                    const urgency = getUrgency(daysLeft);
                    return (
                      <div
                        key={dt}
                        className={`rounded-lg p-2.5 ${urgency.bgClass}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm">{DOC_ICONS[dt]}</span>
                          <span className="text-xs font-medium text-foreground">
                            {DOC_LABELS[dt]}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(t), "dd MMM yyyy")}
                        </div>
                        <div
                          className={`text-xs font-bold mt-0.5 ${urgency.colorClass}`}
                        >
                          {daysLeft < 0
                            ? `Expired ${Math.abs(daysLeft)}d ago`
                            : daysLeft === 0
                              ? "Today!"
                              : `${daysLeft}d left`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddVehicleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditVehicle(null);
        }}
        editVehicle={editVehicle}
      />
    </div>
  );
}
