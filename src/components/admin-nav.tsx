"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview", icon: "◫" },
  { href: "/profiles", label: "Profiles", icon: "◎" },
  { href: "/media", label: "AI media", icon: "◇" },
  { href: "/ratings", label: "Ratings", icon: "☆" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link className={active ? "nav-link active" : "nav-link"} href={link.href} key={link.href}>
            <span aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
