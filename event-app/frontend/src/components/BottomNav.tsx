import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Home", icon: "◆" },
  { to: "/lineup", label: "Lineup", icon: "▲" },
  { to: "/tickets", label: "Tickets", icon: "◈" },
  { to: "/feed", label: "Feed", icon: "●" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-ink px-2 pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md justify-between">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 text-xs tracking-wide transition ${
                  isActive ? "text-white" : "text-white/50 hover:text-white/80"
                }`
              }
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
