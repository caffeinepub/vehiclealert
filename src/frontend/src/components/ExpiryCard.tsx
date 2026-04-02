import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { motion } from "motion/react";
import {
  DOC_ICONS,
  DOC_LABELS,
  type DocType,
  getUrgency,
} from "../utils/urgency";

interface ExpiryCardProps {
  docType: DocType;
  vehicleName: string;
  registration: string;
  expiryTime: number;
  index?: number;
}

export default function ExpiryCard({
  docType,
  vehicleName,
  registration,
  expiryTime,
  index = 0,
}: ExpiryCardProps) {
  const navigate = useNavigate();
  const daysLeft = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
  const urgency = getUrgency(daysLeft);

  const expiryLabel =
    daysLeft < 0
      ? `Expired ${Math.abs(daysLeft)}d ago`
      : daysLeft === 0
        ? "Expires today!"
        : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      data-ocid={`expiry.item.${index + 1}`}
      className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="outline"
          className={`text-xs font-bold tracking-wide ${urgency.badgeClass}`}
        >
          {urgency.label}
        </Badge>
        <span className="text-xl">{DOC_ICONS[docType]}</span>
      </div>
      <div>
        <div className="font-display font-semibold text-foreground">
          {DOC_LABELS[docType]}
        </div>
        <div className="text-sm text-muted-foreground">
          {vehicleName} · {registration}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Expiry date</div>
          <div className="text-sm font-medium text-foreground">
            {format(new Date(expiryTime), "dd MMM yyyy")}
          </div>
        </div>
        <div className={`text-right font-bold text-sm ${urgency.colorClass}`}>
          {expiryLabel}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        data-ocid={`expiry.view_button.${index + 1}`}
        className="w-full mt-auto text-xs"
        onClick={() => navigate({ to: "/vehicles" })}
      >
        View Vehicle
      </Button>
    </motion.div>
  );
}
