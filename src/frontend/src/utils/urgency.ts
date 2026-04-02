export type UrgencyLevel =
  | "expired"
  | "urgent"
  | "due-soon"
  | "upcoming"
  | "ok";

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: string;
  daysLeft: number;
  colorClass: string;
  bgClass: string;
  badgeClass: string;
}

export function getDaysLeft(expiryTime: number): number {
  const now = Date.now();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
}

export function getUrgency(daysLeft: number): UrgencyInfo {
  if (daysLeft < 0) {
    return {
      level: "expired",
      label: "EXPIRED",
      daysLeft,
      colorClass: "text-expired",
      bgClass: "bg-expired-bg",
      badgeClass: "bg-expired-bg text-expired border-expired/30",
    };
  }
  if (daysLeft <= 7) {
    return {
      level: "urgent",
      label: "URGENT",
      daysLeft,
      colorClass: "text-urgent",
      bgClass: "bg-urgent-bg",
      badgeClass: "bg-urgent-bg text-urgent border-urgent/30",
    };
  }
  if (daysLeft <= 30) {
    return {
      level: "due-soon",
      label: "DUE SOON",
      daysLeft,
      colorClass: "text-due-soon",
      bgClass: "bg-due-soon-bg",
      badgeClass: "bg-due-soon-bg text-due-soon border-due-soon/30",
    };
  }
  if (daysLeft <= 90) {
    return {
      level: "upcoming",
      label: "UPCOMING",
      daysLeft,
      colorClass: "text-upcoming",
      bgClass: "bg-upcoming-bg",
      badgeClass: "bg-upcoming-bg text-upcoming border-upcoming/30",
    };
  }
  return {
    level: "ok",
    label: "OK",
    daysLeft,
    colorClass: "text-ok",
    bgClass: "bg-ok-bg",
    badgeClass: "bg-ok-bg text-ok border-ok/30",
  };
}

export function getUrgencyFromExpiry(expiryTime: number): UrgencyInfo {
  return getUrgency(getDaysLeft(expiryTime));
}

export type DocType = "roadTax" | "insurance" | "pollution" | "service";

export const DOC_LABELS: Record<DocType, string> = {
  roadTax: "Road Tax",
  insurance: "Insurance",
  pollution: "PUC Certificate",
  service: "Service",
};

export const DOC_ICONS: Record<DocType, string> = {
  roadTax: "🏛️",
  insurance: "🛡️",
  pollution: "🌿",
  service: "🔧",
};
