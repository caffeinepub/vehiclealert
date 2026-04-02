import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { AlertTriangle, Car, Clock, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import ExpiryCard from "../components/ExpiryCard";
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

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  car: "🚗",
  bike: "🏍️",
  truck: "🚛",
  bus: "🚌",
  other: "🚐",
};

function getNearestExpiry(v: Vehicle): number {
  return [
    v.expiryDates.roadTax,
    v.expiryDates.insurance,
    v.expiryDates.pollution,
    v.expiryDates.service,
  ].reduce((min, t) => (t < min ? t : min));
}

export default function Dashboard() {
  const { data: storedVehicles = [], isLoading } = useGetAllVehicles();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const isSample = storedVehicles.length === 0;
  const vehicles = isSample ? SAMPLE_VEHICLES : storedVehicles;

  const allExpiries = useMemo(() => {
    const items: {
      vehicle: Vehicle;
      docType: DocType;
      daysLeft: number;
      expiryTime: number;
    }[] = [];
    for (const v of vehicles) {
      for (const dt of DOC_TYPES) {
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
  }, [vehicles]);

  const urgentCount = allExpiries.filter((e) => e.daysLeft <= 7).length;
  const dueSoonCount = allExpiries.filter(
    (e) => e.daysLeft > 7 && e.daysLeft <= 30,
  ).length;

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.registration.toLowerCase().includes(search.toLowerCase()),
  );

  const STATS = [
    {
      icon: Car,
      label: "Active Vehicles",
      value: vehicles.length,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      icon: AlertTriangle,
      label: "Urgent (≤7 days)",
      value: urgentCount,
      colorClass: "text-urgent",
      bgClass: "bg-urgent-bg",
    },
    {
      icon: Clock,
      label: "Due Soon (8–30d)",
      value: dueSoonCount,
      colorClass: "text-due-soon",
      bgClass: "bg-due-soon-bg",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome to KOCHUPARAMBIL! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {vehicles.length} Active Vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
            {urgentCount > 0 && (
              <span className="text-urgent font-semibold">
                · {urgentCount} Urgent Expir{urgentCount !== 1 ? "ies" : "y"}
              </span>
            )}
          </p>
          {isSample && (
            <Badge
              variant="outline"
              className="mt-2 text-xs text-due-soon border-due-soon/30 bg-due-soon-bg"
            >
              Sample Data — Add your vehicles to get started
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {STATS.map(({ icon: Icon, label, value, colorClass, bgClass }) => (
          <div
            key={label}
            className="bg-card rounded-xl shadow-card p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
            <div>
              <div className={`font-display font-bold text-2xl ${colorClass}`}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Upcoming Expiries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">
            Upcoming Expiries
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/reminders" })}
            className="text-primary text-xs"
          >
            View all →
          </Button>
        </div>
        {isLoading ? (
          <div
            data-ocid="dashboard.loading_state"
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {["a", "b", "c", "d"].map((k) => (
              <div key={k} className="bg-card rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allExpiries.slice(0, 8).map((item, i) => (
              <ExpiryCard
                key={`${item.vehicle.registration}-${item.docType}`}
                docType={item.docType}
                vehicleName={item.vehicle.name}
                registration={item.vehicle.registration}
                expiryTime={item.expiryTime}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Vehicles summary */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">
            Your Vehicles
          </h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="dashboard.search_input"
              placeholder="Search vehicles..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div
            data-ocid="dashboard.vehicles.empty_state"
            className="bg-card rounded-xl shadow-card p-8 text-center text-muted-foreground"
          >
            <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No vehicles found</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="dashboard.vehicles.table">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                      Vehicle
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">
                      Registration
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                      Next Expiry
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVehicles.map((v, i) => {
                    const nearest = getNearestExpiry(v);
                    const daysLeft = getDaysLeft(nearest);
                    const urgency = getUrgency(daysLeft);
                    const nearestDoc =
                      DOC_TYPES.find((dt) => v.expiryDates[dt] === nearest) ||
                      "insurance";
                    return (
                      <tr
                        key={v.registration}
                        data-ocid={`dashboard.vehicles.row.${i + 1}`}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {VEHICLE_TYPE_ICONS[v.vehicleType] || "🚗"}
                            </span>
                            <div>
                              <div className="font-medium text-sm text-foreground">
                                {v.name}
                              </div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                {v.registration}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                          {v.registration}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell capitalize">
                          {v.vehicleType}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-foreground">
                            {DOC_ICONS[nearestDoc as DocType]}{" "}
                            {DOC_LABELS[nearestDoc as DocType]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(nearest), "dd MMM yyyy")}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${urgency.badgeClass}`}
                          >
                            {urgency.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-primary"
                            onClick={() => navigate({ to: "/vehicles" })}
                            data-ocid={`dashboard.vehicles.view_button.${i + 1}`}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
