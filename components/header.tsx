"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Menu, X, Plus, LogOut, User as UserIcon, Settings, ShieldAlert } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth";
import { LangSwitch } from "@/components/lang-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/primitives";
import { useLocalePath } from "@/lib/i18n/path-client";
import { logoutAction } from "@/app/actions";

export function Header({
  d,
  lang,
  user,
}: {
  d: Dict;
  lang: "it" | "en";
  user: SessionUser | null;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const lp = useLocalePath();

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setQ("");
    setOpen(false);
    router.push(lp(`/esplora?q=${encodeURIComponent(query)}`));
  }

  const nav = [
    { href: "/", label: d.nav.home },
    { href: "/esplora", label: d.nav.explore },
    { href: "/classifiche", label: d.nav.rankings },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--paper) 82%, transparent)", borderColor: "var(--line)" }}
    >
      {/* mobile bar */}
      <div className="flex h-14 items-center gap-1.5 px-3 lg:hidden">
        <Link href={lp("/")} className="flex min-w-0 items-center gap-2" aria-label={d.meta.name}>
          <LogoMark size={22} />
          <span className="font-display truncate text-[18px] font-semibold tracking-[-0.02em] hidden min-[380px]:inline">
            contromano
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Suspense fallback={null}>
            <LangSwitch current={lang} />
          </Suspense>
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} d={d} />
          ) : (
            <button onClick={() => setOpen(true)} className="btn btn-ghost !px-2.5 !py-2 text-sm" style={{ color: "var(--muted)" }}>
              {d.nav.login}
            </button>
          )}
          <button
            className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-[var(--surface2)]"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={d.nav.menu}
          >
            <Menu size={21} />
          </button>
        </div>
      </div>

      {/* desktop bar */}
      <div className="mx-auto hidden h-16 max-w-[1200px] items-center gap-4 px-5 lg:flex lg:h-[72px]">
        <Link href={lp("/")} className="flex items-center gap-2.5" aria-label={d.meta.name}>
          <LogoMark size={26} />
          <span className="font-display text-[21px] font-semibold tracking-[-0.02em]">contromano</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={lp(n.href)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-[var(--surface2)] hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-xs xl:block" role="search">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.nav.search}
            className="input !py-2 !pl-9 !pr-3 !text-[13.5px]"
            aria-label={d.nav.search}
          />
        </form>

        <div className="ml-auto flex items-center gap-3 xl:ml-0">
          <Suspense fallback={null}>
            <LangSwitch current={lang} />
          </Suspense>
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} d={d} />
          ) : (
            <Link href={lp("/accedi")} className="btn btn-secondary !py-2 text-sm">
              {d.nav.login}
            </Link>
          )}
          <Link href={lp("/proponi")} className="btn btn-primary !py-2 text-sm">
            <Plus size={15} strokeWidth={2.6} aria-hidden />
            {d.nav.propose}
          </Link>
        </div>
      </div>

      {/* full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu-panel"
            id="mobile-menu"
            className="flex flex-col overflow-y-auto overscroll-contain lg:hidden"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "var(--paper)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={d.nav.menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16, ease: "easeIn" } }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <motion.div
              className="flex h-14 items-center justify-between px-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <Link href={lp("/")} className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
                <LogoMark size={22} />
                <span className="font-display truncate text-[18px] font-semibold tracking-[-0.02em]">contromano</span>
              </Link>
              <button
                className="-mr-1 flex h-9 w-9 items-center justify-center rounded-full text-ink transition-transform hover:rotate-90"
                onClick={() => setOpen(false)}
                aria-label={d.common.cancel}
              >
                <X size={22} />
              </button>
            </motion.div>

            <motion.div
              className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-8 pt-2"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
                closed: { transition: { staggerChildren: 0.01, staggerDirection: -1 } },
              }}
            >
              <motion.form
                onSubmit={submitSearch}
                className="relative mb-4"
                role="search"
                variants={menuItem}
              >
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={d.nav.search}
                  className="input !rounded-xl !py-3.5 !pl-11 !text-[16px]"
                  aria-label={d.nav.search}
                />
              </motion.form>

              <nav className="flex flex-col" aria-label={d.nav.menu}>
                {nav.map((n) => {
                  const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
                  return (
                    <motion.div key={n.href} variants={menuItem}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-center justify-between border-b py-4"
                        style={{ borderColor: "var(--surface2)" }}
                      >
                        <span
                          className={`font-display text-[26px] font-semibold tracking-[-0.02em] transition-colors ${
                            active ? "" : "group-hover:text-[var(--signal)]"
                          }`}
                          style={active ? { color: "var(--signal)" } : undefined}
                        >
                          {n.label}
                        </span>
                        <span
                          aria-hidden
                          className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-60"
                          style={active ? { opacity: 1, color: "var(--signal)" } : undefined}
                        >
                          →
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="flex-1" />

              {user && (
                <motion.div variants={menuItem}>
                  <Link
                    href={lp(`/profilo/${user.username}`)}
                    className="mb-3 flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:bg-[var(--surface2)]"
                    style={{ borderColor: "var(--line)" }}
                    onClick={() => setOpen(false)}
                  >
                    <Avatar name={user.name} seed={user.id} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{user.name}</span>
                      <span className="block text-[12px] text-faint">@{user.username}</span>
                    </span>
                  </Link>
                </motion.div>
              )}

              {!user && (
                <motion.div variants={menuItem} className="mb-3">
                  <Link href={lp("/registrati")} onClick={() => setOpen(false)} className="btn btn-secondary w-full justify-center">
                    {d.nav.register}
                  </Link>
                </motion.div>
              )}

              <motion.div variants={menuItem}>
                <Link
                  href={lp("/proponi")}
                  onClick={() => setOpen(false)}
                  className="btn btn-primary w-full justify-center !py-4 text-base"
                >
                  <Plus size={17} strokeWidth={2.6} aria-hidden />
                  {d.hero.ctaPrimary}
                </Link>
              </motion.div>

              <motion.div
                variants={menuItem}
                className="mt-5 flex items-center justify-between border-t pt-5"
                style={{ borderColor: "var(--surface2)" }}
              >
                <ThemeToggle />
                {user ? (
                  <button
                    onClick={() => start(() => logoutAction())}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--oppose)" }}
                  >
                    <LogOut size={15} aria-hidden /> {d.nav.logout}
                  </button>
                ) : (
                  <Link href={lp("/accedi")} onClick={() => setOpen(false)} className="btn btn-secondary !py-2 text-sm">
                    {d.nav.login}
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const menuItem = {
  closed: { opacity: 0, y: 14 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.2, 0.7, 0.2, 1] as const },
  },
};

function UserMenu({ user, d }: { user: SessionUser; d: Dict }) {
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const lp = useLocalePath();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border p-1 transition-colors hover:bg-[var(--surface2)] sm:pr-2.5"
        style={{ borderColor: "var(--line)" }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={d.nav.profile}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <Avatar name={user.name} seed={user.id} size={28} />
        <span className="hidden max-w-24 truncate text-sm font-medium sm:block">{user.name.split(" ")[0]}</span>
        <span className="sr-only">{user.name}</span>
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} aria-hidden tabIndex={-1} />
          <div
            role="menu"
            className="card absolute right-0 z-20 mt-2 w-52 overflow-hidden p-1.5"
            style={{ boxShadow: "var(--shadow-lift)" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            <Link
              href={lp(`/profilo/${user.username}`)}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface2)]"
            >
              <UserIcon size={15} aria-hidden /> {d.nav.profile}
            </Link>
            <Link
              href={lp("/impostazioni")}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface2)]"
            >
              <Settings size={15} aria-hidden /> {d.nav_settings}
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin/segnalazioni"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-[var(--surface2)]"
              >
                <ShieldAlert size={15} aria-hidden /> {d.admin.title}
              </Link>
            )}
            <button
              role="menuitem"
              onClick={() => start(() => logoutAction())}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-[var(--surface2)]"
              style={{ color: "var(--oppose)" }}
            >
              <LogOut size={15} aria-hidden /> {d.nav.logout}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden className="shrink-0">
      <rect width="26" height="26" rx="8" style={{ fill: "var(--ink)" }} />
      <path d="M7 18L19 8" stroke="var(--paper)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12.5 7H19V13.5" stroke="var(--paper)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13V18H13.5" stroke="var(--signal)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
