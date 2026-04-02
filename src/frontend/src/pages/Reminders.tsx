import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Filter } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { SAMPLE_VEHICLES } from "../data/sampleVehicles";
import { useGetAllVehicles } from "../hooks/useQueries";
import type { Vehicle } from "../types";
import {
  DOC_ICONS,
  DOC_LABELS,
  type DocType,
  getDaysLeft,
  getUrgency,
} from "../utils/urgency";

const DOC_TYPES: DocType[] = ["roadTax", "insurance", "pollution", "service"];

type GroupKey = "expired" | "urgent" | "due-soon" | "upcoming" | "ok";

const GROUP_CONFIG: {
  key: GroupKey;
  label: string;
  colorClass: string;
  borderClass: string;
}[] = [
  {
    key: "expired",
    label: "Expired",
    colorClass: "text-expired",
    borderClass: "border-expired/40",
  },
  {
    key: "urgent",
    label: "Urgent — within 7 days",
    colorClass: "text-urgent",
    borderClass: "border-urgent/40",
  },
  {
    key: "due-soon",
    label: "Due Soon — 8 to 30 days",
    colorClass: "text-due-soon",
    borderClass: "border-due-soon/40",
  },
  {
    key: "upcoming",
    label: "Upcoming — 31 to 90 days",
    colorClass: "text-upcoming",
    borderClass: "border-upcoming/40",
  },
  {
    key: "ok",
    label: "OK — more than 90 days",
    colorClass: "text-ok",
    borderClass: "border-ok/40",
  },
];

export default function Reminders() {
  const { data: storedVehicles = [] } = useGetAllVehicles();
  const isSample = storedVehicles.length === 0;
  const vehicles = isSample ? SAMPLE_VEHICLES : storedVehicles;

  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [docFilter, setDocFilter] = useState<string>("all");

  const allExpiries = useMemo(() => {
    const items: {
      vehicle: Vehicle;
      docType: DocType;
      daysLeft: number;
      expiryTime: number;
    }[] = [];
    const filtered =
      vehicleFilter === "all"
        ? vehicles
        : vehicles.filter((v) => v.registration === vehicleFilter);
    const docTypes = docFilter === "all" ? DOC_TYPES : [docFilter as DocType];
    for (const v of filtered) {
      for (const dt of docTypes) {
        const t = v.expiryDates[dt];
        items.push({
          vehicle: v,
          docType: dt,
          daysLeft: getDaysLeft(t),
          expiryTime: t,
        });
      }
    }
    return items.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [vehicles, vehicleFilter, docFilter]);

  const grouped = useMemo(() => {
    const map: Record<GroupKey, typeof allExpiries> = {
      expired: [],
      urgent: [],
      "due-soon": [],
      upcoming: [],
      ok: [],
    };
    for (const item of allExpiries) {
      map[getUrgency(item.daysLeft).level].push(item);
    }
    return map;
  }, [allExpiries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Reminders
          </h1>
          <p className="text-muted-foreground text-sm">
            All upcoming expiry reminders grouped by urgency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger
              data-ocid="reminders.vehicle.select"
              className="w-40 h-8 text-xs"
            >
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.registration} value={v.registration}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger
              data-ocid="reminders.doctype.select"
              className="w-40 h-8 text-xs"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOC_TYPES.map((dt) => (
                <SelectItem key={dt} value={dt}>
                  {DOC_ICONS[dt]} {DOC_LABELS[dt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isSample && (
        <Badge
          variant="outline"
          className="text-xs text-due-soon border-due-soon/30 bg-due-soon-bg"
        >
          Sample Data
        </Badge>
      )}

      {GROUP_CONFIG.map(({ key, label, colorClass, borderClass }) => {
        const items = grouped[key];
        if (items.length === 0) return null;
        return (
          <section key={key}>
            <h2
              className={`font-display font-bold text-base mb-3 ${colorClass}`}
            >
              {label}
            </h2>
            <div className="space-y-2">
              {items.map((item, i) => {
                const urgency = getUrgency(item.daysLeft);
                return (
                  <motion.div
                    key={`${item.vehicle.registration}-${item.docType}`}
                    data-ocid={`reminders.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className={`bg-card rounded-xl shadow-card border-l-4 ${borderClass} p-4 flex items-center justify-between gap-4`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">
                        {DOC_ICONS[item.docType]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground">
                          {DOC_LABELS[item.docType]}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.vehicle.name} · {item.vehicle.registration}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-foreground">
                        {format(new Date(item.expiryTime), "dd MMM yyyy")}
                      </div>
                      <div
                        className={`text-xs font-bold ${urgency.colorClass}`}
                      >
                        {item.daysLeft < 0
                          ? `Expired ${Math.abs(item.daysLeft)}d ago`
                          : item.daysLeft === 0
                            ? "Today"
                            : `${item.daysLeft}d left`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
