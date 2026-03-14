"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value.trim().toLowerCase() }),
    });

    if (res.ok) {
      const from = searchParams.get("from") || "/";
      router.push(from);
      router.refresh();
    } else {
      setError(true);
      setValue("");
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-xs">
      <input
        ref={inputRef}
        type="password"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError(false); }}
        placeholder="Enter passphrase"
        autoComplete="off"
        className={`w-full bg-transparent border-b text-center text-sm text-ss-ink placeholder:text-ss-taupe/50 outline-none py-3 tracking-[0.12em] transition-colors ${
          error ? "border-red-400" : "border-ss-border focus:border-ss-ink"
        }`}
      />
      {error && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-red-400 -mt-2">
          Incorrect passphrase
        </p>
      )}
      <button
        type="submit"
        disabled={!value.trim() || loading}
        className="border border-ss-ink text-ss-ink text-[11px] tracking-[0.22em] uppercase px-10 py-3.5 hover:bg-ss-ink hover:text-white transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed w-full"
      >
        {loading ? "…" : "Enter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-ss-cream min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-10 w-full">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] text-ss-taupe uppercase mb-6">
            230 S Canby · Portland, OR USA
          </p>
          <h1
            className="font-display font-light text-ss-ink leading-[0.9] mb-1"
            style={{ fontSize: "clamp(42px, 6vw, 72px)" }}
          >
            SOUTH
          </h1>
          <h1
            className="font-display font-light italic text-ss-ink leading-[0.9]"
            style={{ fontSize: "clamp(42px, 6vw, 72px)" }}
          >
            Sanctuary
          </h1>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
