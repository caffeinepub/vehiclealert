import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Car, Menu, X } from "lucide-react";
import { useState } from "react";
import { useGetAllVehicles } from "../hooks/useQueries";
import type { Vehicle } from "../types";
import { getDaysLeft } from "../utils/urgency";

const NAV_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/reminders", label: "Reminders" },
  { to: "/settings", label: "Settings" },
];

function countUrgent(vehicles: Vehicle[]) {
  let count = 0;
  for (const v of vehicles) {
    for (const t of [
      v.expiryDates.roadTax,
      v.expiryDates.insurance,
      v.expiryDates.pollution,
      v.expiryDates.service,
    ]) {
      if (getDaysLeft(t) <= 7) count++;
    }
  }
  return count;
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { data: vehicles = [] } = useGetAllVehicles();
  const urgentCount = countUrgent(vehicles);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/kocuparambil-logo.jpg"
              alt="KOCHUPARAMBIL"
              className="w-10 h-10 object-contain rounded"
            />
            <span className="font-display font-bold italic text-xl text-primary uppercase">
              KOCHUPARAMBIL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1 ml-6"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ to, label }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={`nav.${label.toLowerCase()}.link`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <Link
              to="/reminders"
              data-ocid="nav.bell.link"
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {urgentCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-urgent text-white border-0">
                  {urgentCount}
                </Badge>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden bg-card border-t border-border px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>KOCHUPARAMBIL — Keep your vehicles compliant</span>
          </div>
          <div>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
