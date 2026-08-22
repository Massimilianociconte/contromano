import Link from "next/link";
import type { ReactNode } from "react";
import { CATEGORY_META, type Category } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CircleSlash,
  PlusCircle,
  RefreshCw,
  Lightbulb,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  CircleSlash,
  PlusCircle,
  RefreshCw,
  Lightbulb,
  EyeOff,
};

export function CategoryBadge({
  category,
  label,
  soft = true,
  size = "md",
}: {
  category: Category;
  label: string;
  soft?: boolean;
  size?: "sm" | "md";
}) {
  const meta = CATEGORY_META[category];
  const Icon = ICONS[meta.icon] ?? CircleSlash;
  return (
    <span
      className="pill"
      style={{
        background: soft ? meta.soft : "transparent",
        color: meta.color,
        border: soft ? "none" : `1px solid ${meta.color}55`,
        fontSize: size === "sm" ? 11.5 : undefined,
        padding: size === "sm" ? "2px 9px" : undefined,
      }}
    >
      <Icon size={size === "sm" ? 12 : 13.5} strokeWidth={2.4} aria-hidden />
      {label}
    </span>
  );
}

export function Avatar({
  name,
  seed,
  size = 36,
}: {
  name: string;
  seed: string;
  size?: number;
}) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = [14, 36, 152, 200, 260, 300, 340, 96][h % 8];
  const init = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 55% 88%), hsl(${(hue + 40) % 360} 50% 78%))`,
        color: `hsl(${hue} 45% 28%)`,
      }}
    >
      {init || "?"}
    </span>
  );
}

export function SectionHeader({
  kicker,
  title,
  href,
  linkLabel,
  accent,
}: {
  kicker?: ReactNode;
  title: string;
  href?: string;
  linkLabel?: string;
  accent?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {kicker && (
          <p
            className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accent ?? "var(--trend)" }}
          >
            {kicker}
          </p>
        )}
        <h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.01em] md:text-[30px]">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink sm:inline-flex"
        >
          {linkLabel}
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-8 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--surface2)" }}
      >
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function CardSkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card p-6">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="mt-4 h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-4/5" />
          <Skeleton className="mt-6 h-9 w-full" />
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
