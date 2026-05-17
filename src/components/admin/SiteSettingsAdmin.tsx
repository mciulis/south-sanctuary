"use client";

import { useState, useEffect } from "react";

export default function SiteSettingsAdmin() {
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [savedPickupAddress, setSavedPickupAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPickup, setSavingPickup] = useState(false);
  const [toggleMsg, setToggleMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [pickupMsg, setPickupMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setProtectionEnabled(data.password_protection_enabled === "true");
        setPassword(data.site_password ?? "");
        setPickupAddress(data.pickup_address ?? "");
        setSavedPickupAddress(data.pickup_address ?? "");
        setLoading(false);
      });
  }, []);

  async function handlePickupAddressSave() {
    setSavingPickup(true);
    setPickupMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
      },
      body: JSON.stringify({ pickup_address: pickupAddress }),
    });
    if (res.ok) {
      setSavedPickupAddress(pickupAddress);
      setPickupMsg("Pickup address saved.");
    } else {
      setPickupMsg("Failed to save. Please try again.");
    }
    setSavingPickup(false);
    setTimeout(() => setPickupMsg(""), 3000);
  }

  async function handleToggle(enabled: boolean) {
    setSaving(true);
    setToggleMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
      },
      body: JSON.stringify({ password_protection_enabled: enabled }),
    });
    if (res.ok) {
      setProtectionEnabled(enabled);
      setToggleMsg(enabled ? "Password protection enabled." : "Password protection disabled.");
    } else {
      setToggleMsg("Failed to save. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setToggleMsg(""), 3000);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }
    if (newPassword.trim().length < 4) {
      setPasswordMsg("Password must be at least 4 characters.");
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
      },
      body: JSON.stringify({ site_password: newPassword.trim() }),
    });
    if (res.ok) {
      setPassword(newPassword.trim());
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg("Password updated.");
    } else {
      setPasswordMsg("Failed to save. Please try again.");
    }
    setSavingPassword(false);
    setTimeout(() => setPasswordMsg(""), 4000);
  }

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>;
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-sm font-medium text-gray-800 tracking-wide uppercase mb-1">Site Access</h2>
        <p className="text-xs text-gray-400 mb-5">
          When enabled, visitors must enter a passphrase to view the site.
        </p>

        <div className="flex items-center justify-between border border-gray-200 rounded px-5 py-4 bg-white">
          <div>
            <p className="text-sm text-gray-700 font-medium">Password Protection</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {protectionEnabled ? "Visitors must enter a passphrase." : "Site is publicly accessible."}
            </p>
          </div>
          <button
            onClick={() => handleToggle(!protectionEnabled)}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              protectionEnabled ? "bg-gray-800" : "bg-gray-300"
            } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            role="switch"
            aria-checked={protectionEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                protectionEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {toggleMsg && (
          <p className={`text-xs mt-2 ${toggleMsg.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
            {toggleMsg}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-800 tracking-wide uppercase mb-1">Change Passphrase</h2>
        <p className="text-xs text-gray-400 mb-5">
          Current passphrase: <span className="font-mono text-gray-600">{password}</span>
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New passphrase"
            className="w-full border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-gray-500 rounded"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new passphrase"
            className="w-full border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-gray-500 rounded"
          />
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.includes("Failed") || passwordMsg.includes("match") || passwordMsg.includes("least") ? "text-red-500" : "text-green-600"}`}>
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={savingPassword || !newPassword || !confirmPassword}
            className="bg-gray-800 text-white text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
          >
            {savingPassword ? "Saving…" : "Update Passphrase"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-800 tracking-wide uppercase mb-1">Pickup Address</h2>
        <p className="text-xs text-gray-400 mb-5">
          Default address sent to buyers in pickup-confirmation emails and used for Google Calendar events.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            placeholder="e.g. 1234 SE Example St, Portland OR 97214"
            className="w-full border border-gray-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-gray-500 rounded"
          />
          {pickupMsg && (
            <p className={`text-xs ${pickupMsg.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
              {pickupMsg}
            </p>
          )}
          <button
            type="button"
            onClick={handlePickupAddressSave}
            disabled={savingPickup || pickupAddress === savedPickupAddress}
            className="bg-gray-800 text-white text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded"
          >
            {savingPickup ? "Saving…" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
