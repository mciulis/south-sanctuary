"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "STORY", href: "/" },
  { label: "GALLERY", href: "/gallery" },
  { label: "ESTATE SALE", href: "/estate-sale" },
  { label: "CONTACT", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-ss-cream/80 backdrop-blur-sm border-b border-ss-border/40">
      {/* Site name */}
      <Link
        href="/"
        className="text-[11px] tracking-[0.22em] font-medium text-ss-ink uppercase"
      >
        230 S Canby
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-[11px] tracking-[0.18em] transition-opacity ${
              pathname === link.href
                ? "text-ss-ink opacity-100"
                : "text-ss-ink-soft opacity-70 hover:opacity-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile nav */}
      <Sheet>
        <SheetTrigger className="md:hidden text-ss-ink" aria-label="Open menu">
          <Menu size={18} />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="bg-ss-cream border-ss-border w-64"
        >
          <nav className="flex flex-col gap-7 pt-14 px-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
