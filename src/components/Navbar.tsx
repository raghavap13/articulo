"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, User } from "lucide-react";
import { getStoredPatients, getActivePatient, setActivePatientId } from "@/lib/store";
import { Patient } from "@/lib/types";
import ArticuloLogo from "@/components/ArticuloLogo";

export default function Navbar() {
  const pathname = usePathname();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  useEffect(() => {
    const update = () => {
      const all = getStoredPatients();
      setPatients(all);
      setActivePatient(getActivePatient());
    };
    update();
    window.addEventListener("articulo-storage-update", update);
    return () => window.removeEventListener("articulo-storage-update", update);
  }, []);

  const handlePatientSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivePatientId(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand with authentic logo */}
        <Link href="/" className="flex items-center group py-2">
          <ArticuloLogo variant="horizontal" size="sm" className="group-hover:opacity-90 transition-opacity" />
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              pathname === "/"
                ? "bg-[#0E2453]/10 text-[#0E2453]"
                : "text-slate-600 hover:text-[#0E2453] hover:bg-slate-50"
            }`}
          >
            Overview
          </Link>

          <Link
            href="/patient"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              pathname.startsWith("/patient")
                ? "bg-[#33B0AA]/15 text-[#0E2453] border border-[#33B0AA]/40"
                : "text-slate-600 hover:text-[#0E2453] hover:bg-slate-50"
            }`}
          >
            <User className="w-4 h-4 text-[#33B0AA]" />
            <span>Patient Portal</span>
          </Link>

          <Link
            href="/therapist"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              pathname.startsWith("/therapist")
                ? "bg-[#3980BE]/15 text-[#0E2453] border border-[#3980BE]/40"
                : "text-slate-600 hover:text-[#0E2453] hover:bg-slate-50"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#3980BE]" />
            <span>Therapist Portal</span>
          </Link>
        </nav>

        {/* Active Patient Switcher */}
        {activePatient && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-400 font-medium">Viewing as:</span>
            <select
              value={activePatient.id}
              onChange={handlePatientSwitch}
              className="text-xs font-bold text-[#0E2453] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3980BE] cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.diagnosis.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
