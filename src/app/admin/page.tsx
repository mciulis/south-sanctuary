"use client";

import { useState, useEffect } from "react";
import EstateSaleAdmin from "@/components/admin/EstateSaleAdmin";
import GalleryAdmin from "@/components/admin/GalleryAdmin";
import HomepageAdmin from "@/components/admin/HomepageAdmin";
import RecordsAdmin from "@/components/admin/RecordsAdmin";
import ReservationsAdmin from "@/components/admin/ReservationsAdmin";
import SiteSettingsAdmin from "@/components/admin/SiteSettingsAdmin";

const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD!;
const SESSION_KEY = "ss_admin_auth";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"estate" | "gallery" | "homepage" | "records" | "reservations" | "settings">("homepage");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-72">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-6 text-center">
            South Sanctuary — Admin
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className={`w-full border px-4 py-3 text-sm bg-white focus:outline-none focus:border-gray-800 transition-colors ${
              error ? "border-red-400" : "border-gray-300"
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-2">Incorrect password.</p>}
          <button
            type="submit"
            className="w-full mt-3 bg-gray-800 text-white text-xs tracking-widest uppercase py-3 hover:bg-gray-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <p className="text-xs tracking-widest uppercase text-gray-500">
          South Sanctuary — Admin
        </p>
        <div className="flex gap-1">
          {(["homepage", "gallery", "estate", "records", "reservations", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs tracking-wide rounded transition-colors ${
                tab === t
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t === "estate" ? "Estate Sale" : t === "gallery" ? "Gallery" : t === "records" ? "Records" : t === "reservations" ? "Reservations" : t === "settings" ? "Settings" : "Homepage"}
            </button>
          ))}
        </div>
        <button
          onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        {tab === "estate" ? <EstateSaleAdmin /> : tab === "gallery" ? <GalleryAdmin /> : tab === "records" ? <RecordsAdmin /> : tab === "reservations" ? <ReservationsAdmin /> : tab === "settings" ? <SiteSettingsAdmin /> : <HomepageAdmin />}
      </div>
    </div>
  );
}
