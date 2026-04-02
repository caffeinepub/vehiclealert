import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Database, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "../hooks/useQueries";

export default function Settings() {
  const [thresholds, setThresholds] = useState<AppSettings>(loadSettings);

  const toggle = (k: keyof AppSettings) => {
    setThresholds((p) => {
      const next = { ...p, [k]: !p[k] };
      saveSettings(next);
      return next;
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Customize your KOCHUPARAMBIL preferences
        </p>
      </div>

      {/* Storage info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <CardTitle className="font-display text-base">
                Data Storage
              </CardTitle>
            </div>
            <CardDescription>
              All vehicle data is saved locally on this device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Storage type
              </span>
              <Badge className="bg-ok-bg text-ok border-ok/30 text-xs">
                Local Storage
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                Internet required
              </span>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                No — works offline
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reminder thresholds */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <CardTitle className="font-display text-base">
                Reminder Thresholds
              </CardTitle>
            </div>
            <CardDescription>
              Choose when to receive in-app alerts before expiry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "day30" as const,
                label: "30 days before",
                desc: "Early warning",
              },
              {
                key: "day7" as const,
                label: "7 days before",
                desc: "Upcoming expiry",
              },
              {
                key: "day3" as const,
                label: "3 days before",
                desc: "Urgent reminder",
              },
              {
                key: "day1" as const,
                label: "1 day before",
                desc: "Final reminder",
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor={`threshold-${key}`}
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  id={`threshold-${key}`}
                  data-ocid={`settings.${key}.switch`}
                  checked={thresholds[key]}
                  onCheckedChange={() => toggle(key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="font-display text-base">
                Notification Channels
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">In-App Alerts</span>
              <Badge className="bg-ok-bg text-ok border-ok/30 text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 opacity-50">
              <span className="text-sm text-foreground">
                Email Notifications
              </span>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Not available
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 opacity-50">
              <span className="text-sm text-foreground">SMS Alerts</span>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Not available
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
