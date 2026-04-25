"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Bot, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

type NavItem = { label: string; href: string };

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Resume Analyzer", href: "/resumeanalyzer" },
      { label: "Interview Coach", href: "/interviewcoach" },
      { label: "Job Finder", href: "/jobfinder" },
      { label: "Resume Builder", href: "/resumebuilder" },
      { label: "Jobs", href: "/jobs" },
    ],
    []
  );

  const linkClass = (href: string) =>
    clsx(
      "text-sm font-medium transition-colors",
      pathname === href ? "text-white" : "text-gray-300 hover:text-white"
    );

  return (
    <header className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HireSense</span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex px-5 py-2 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Get started
            </Link>

            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.href)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

