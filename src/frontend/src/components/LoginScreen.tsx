import { Button } from "@/components/ui/button";
import { Bell, Calendar, Car, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/kocuparambil-logo.jpg"
              alt="KOCHUPARAMBIL"
              className="w-14 h-14 object-contain rounded-lg"
            />
            <span className="font-display text-3xl font-bold italic text-primary uppercase">
              KOCHUPARAMBIL
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
            Never miss a vehicle deadline again
          </h1>
          <p className="text-muted-foreground text-lg">
            Track road tax, insurance, PUC, and service schedules for all your
            vehicles in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Shield,
                label: "Insurance Tracking",
                desc: "Get alerted before expiry",
              },
              {
                icon: Bell,
                label: "Smart Reminders",
                desc: "7, 3, and 1 day alerts",
              },
              {
                icon: Car,
                label: "Multiple Vehicles",
                desc: "Cars, bikes, trucks & more",
              },
              {
                icon: Calendar,
                label: "Expiry Calendar",
                desc: "See all dates at a glance",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 rounded-lg bg-card shadow-card"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl shadow-card-hover p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to manage your vehicles
            </p>
          </div>
          <Button
            data-ocid="login.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secure, decentralized authentication via Internet Identity
          </p>
        </motion.div>
      </div>
    </div>
  );
}
