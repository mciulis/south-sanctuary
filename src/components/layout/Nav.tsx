"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "STORY", href: "/" },
  { label: "MOVING SALE", href: "/moving-sale" },
  { label: "GALLERY", href: "/gallery" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // On the home page: transparent until scrolled. Everywhere else: always solid.
  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-colors duration-300 ${
        solid
          ? "bg-ss-cream/90 backdrop-blur-sm border-b border-ss-border/40"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Site name */}
      <Link
        href="/"
        className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 ${
          solid ? "text-ss-ink" : "text-white/80"
        }`}
      >
        230 S Canby
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[11px] tracking-[0.18em] transition-all duration-300 ${
              solid
                ? pathname === link.href
                  ? "text-ss-ink opacity-100"
                  : "text-ss-ink-soft opacity-70 hover:opacity-100"
                : pathname === link.href
                ? "text-white opacity-100"
                : "text-white/60 hover:text-white hover:opacity-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile nav */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          className={`md:hidden transition-colors duration-300 ${solid ? "text-ss-ink" : "text-white/80"}`}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </SheetTrigger>
        <SheetContent side="right" className="bg-ss-cream border-ss-border w-64">
          <nav className="flex flex-col gap-7 pt-14 px-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[11px] tracking-[0.22em] text-ss-ink uppercase hover:text-ss-taupe transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
