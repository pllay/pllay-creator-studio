import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Radio,
  Music,
  Gauge,
  Zap,
  ScanEye,
  Sparkles,
  Gamepad2,
  Trophy,
  Swords,
  Rocket,
  Users,
  HelpCircle,
  Settings,
  LogOut,
  PanelLeft,
  Search,
  Bell,
  LineChart,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { useStudio } from "@/lib/studio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand-logo";

const NAV = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", to: "/", icon: Home },
      { title: "Analytics", to: "/analytics", icon: LineChart },
    ],
  },
  {
    label: "Stream Setup",
    items: [
      { title: "Overlay Control", to: "/overlay-control", icon: Radio },
      { title: "Set Tools", to: "/set-tools", icon: Music },
      { title: "OBS Overlay", to: "/obs-overlay", icon: Gauge },
    ],
  },
  {
    label: "Interactions",
    items: [
      { title: "Predictions", to: "/predictions", icon: Zap },
      { title: "Vision AI", to: "/vision", icon: ScanEye },
      { title: "Moment Agent", to: "/moment-agent", icon: Sparkles },
      { title: "Pulse Studio", to: "/pulse", icon: Radio },
      { title: "Arena", to: "/arena", icon: Gamepad2 },
      { title: "Leaderboard", to: "/leaderboard", icon: Trophy },
      { title: "Rivals", to: "/rivals", icon: Swords },
    ],
  },
];

const FOOTER = [
  { title: "Plans", to: "/plans", icon: Rocket },
  { title: "Team", to: "/team", icon: Users },
  { title: "Support", to: "/support", icon: HelpCircle },
  { title: "Settings", to: "/settings", icon: Settings },
];

const ALL_PAGES = [
  ...NAV.flatMap((s) => s.items),
  ...FOOTER,
  { title: "Fan", to: "/fan", icon: Zap },
];

function NavItem({
  to,
  title,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  title: string;
  icon: typeof Home;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm transition-colors duration-150",
        active ? "bg-accent/15 font-medium text-accent" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <span>{title}</span>
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const reset = useStudio((s) => s.reset);
  const navigate = useNavigate();
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-line bg-surface">
      <Link to="/" onClick={onNavigate} className="flex h-14 items-center border-b border-line px-4">
        <BrandLogo />
      </Link>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {NAV.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} {...item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-line px-2 py-3">
        {FOOTER.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
        <Link
          to="/fan"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm text-accent hover:bg-elevated"
        >
          <Zap className="size-[18px]" />
          Switch to Fan
        </Link>
        <button
          type="button"
          className="flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 text-left text-sm text-subtle hover:bg-elevated hover:text-fg"
          onClick={() => {
            reset();
            onNavigate?.();
            void navigate({ to: "/" });
            toast.success("Studio session cleared");
          }}
        >
          <LogOut className="size-[18px]" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

export function StudioShell() {
  const demo = useStudio((s) => s.demoBanner);
  const dismiss = useStudio((s) => s.dismissDemo);
  const queue = useStudio(
    (s) =>
      s.moments.filter((m) => m.status === "under_review").length +
      s.reviews.filter((r) => r.status === "pending").length,
  );
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return ALL_PAGES;
    return ALL_PAGES.filter((p) => p.title.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[240px]">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-[70]">
        {demo ? (
          <div className="flex items-center justify-center gap-3 bg-accent px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-fg">
            Studio preview — no real money
            <button type="button" className="underline decoration-accent-fg/40" onClick={dismiss}>
              Hide
            </button>
          </div>
        ) : null}
        <header className="flex h-14 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <PanelLeft className="size-4" />
          </Button>
          <Link to="/" className="md:hidden">
            <BrandLogo className="h-6" />
          </Link>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              setNotesOpen(false);
              setSearchOpen(true);
            }}
            className="hidden items-center gap-2 rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-xs text-subtle hover:text-fg sm:flex"
          >
            <Search className="size-3.5" />
            Search
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => {
              setNotesOpen(false);
              setSearchOpen(true);
            }}
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={queue > 0 ? `${queue} waiting in Pulse` : "Notifications"}
            aria-expanded={notesOpen}
            onClick={() => {
              setSearchOpen(false);
              setNotesOpen((v) => !v);
            }}
          >
            <Bell className="size-4" />
            {queue > 0 ? <span className="absolute right-1 top-1 size-1.5 rounded-full bg-accent" /> : null}
          </Button>
        </header>
        </div>
        <main className={cn("flex-1 overflow-auto p-4 sm:p-6 lg:p-8", notesOpen && "sm:!pr-[24rem]")}>
          <Outlet />
        </main>
      </div>
      {notesOpen ? <QueuePanel banner={demo} onClose={() => setNotesOpen(false)} /> : null}
      {searchOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-bg/70 p-4 pt-24">
          <button type="button" className="absolute inset-0" aria-label="Close search" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-line bg-surface p-3">
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump to a page"
              aria-label="Search studio"
            />
            <div className="mt-2 max-h-64 overflow-auto">
              {results.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    setSearchOpen(false);
                    setQ("");
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-sm text-fg hover:bg-elevated"
                >
                  <item.icon className="size-4 text-muted" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "bg-surface border-line text-fg",
        }}
      />
    </div>
  );
}

function QueuePanel({ banner, onClose }: { banner: boolean; onClose: () => void }) {
  const moments = useStudio((s) => s.moments);
  const reviews = useStudio((s) => s.reviews);
  const pools = useStudio((s) => s.pools);
  const items = [
    ...moments
      .filter((moment) => moment.status === "under_review")
      .map((moment) => ({
        id: moment.id,
        to: "/moment-agent" as const,
        title: "Under review",
        body: moment.description,
      })),
    ...reviews
      .filter((review) => review.status === "pending")
      .map((review) => ({
        id: review.id,
        to: "/moment-agent" as const,
        title: "Draft",
        body: review.prompt,
      })),
    ...pools
      .filter((pool) => pool.status === "live")
      .map((pool) => ({
        id: pool.id,
        to: "/predictions" as const,
        title: "Live pool",
        body: pool.question,
      })),
  ].slice(0, 6);

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-bg sm:bg-transparent"
        aria-label="Close notifications"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-3 right-3 rounded-[var(--radius-lg)] border border-line bg-surface p-3 sm:left-auto sm:right-4 sm:w-[22rem]",
          banner ? "top-[5.75rem]" : "top-16",
        )}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Queue</p>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Queue is clear.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="block rounded-[var(--radius-sm)] px-2 py-2 hover:bg-elevated"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">{item.title}</p>
                  <p className="truncate text-sm">{item.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
