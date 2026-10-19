"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Stethoscope, User, LogOut, LogIn } from "lucide-react";
import {
  getStoredPatients,
  getActivePatient,
  setActivePatientId,
  getAuthSession,
  logoutSession,
} from "@/lib/store";
import { Patient, AuthSession } from "@/lib/types";
import ArticuloLogo from "@/components/ArticuloLogo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const update = () => {
      const all = getStoredPatients();
      setPatients(all);
      setActivePatient(getActivePatient());
      setSession(getAuthSession());
    };
    update();
    window.addEventListener("articulo-storage-update", update);
    return () => window.removeEventListener("articulo-storage-update", update);
  }, []);

  const handlePatientSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivePatientId(e.target.value);
  };

  const handleSignOut = () => {
    logoutSession();
    router.push("/login");
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
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              pathname === "/"
                ? "bg-[#0E2453]/10 text-[#0E2453]"
                : "text-slate-600 hover:text-[#0E2453] hover:bg-slate-50"
            }`}
          >
            Overview
          </Link>

          <Link
            href="/patient"
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
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
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              pathname.startsWith("/therapist")
                ? "bg-[#3980BE]/15 text-[#0E2453] border border-[#3980BE]/40"
                : "text-slate-600 hover:text-[#0E2453] hover:bg-slate-50"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-[#3980BE]" />
            <span>Therapist Portal</span>
          </Link>
        </nav>

        {/* Auth / Session Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              {/* User badge */}
              <div className="flex items-center gap-2">
                {session.avatar ? (
                  <img
                    src={session.avatar}
                    alt={session.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0E2453] text-[#33B0AA] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#0E2453] leading-none">
                      {session.name.split(" ")[0]}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        session.role === "patient"
                          ? "bg-[#33B0AA]/15 text-[#33B0AA]"
                          : "bg-[#3980BE]/15 text-[#3980BE]"
                      }`}
                    >
                      {session.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient switcher (only when in patient role or viewing demo roster) */}
              {session.role === "patient" && activePatient && (
                <select
                  value={activePatient.id}
                  onChange={handlePatientSwitch}
                  className="hidden md:block text-[11px] font-bold text-[#0E2453] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#33B0AA] cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Sign out */}
              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign out of current account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <Link
                href="/login"
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  pathname === "/login"
                    ? "bg-[#0E2453] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-[#0E2453]"
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#FFA33E]" />
                <span>Log In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
