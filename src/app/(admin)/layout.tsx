import { signOut } from "@/app/auth/actions";
import { AdminNav } from "@/components/admin-nav";
import { requireSuperadmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireSuperadmin();
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Admin";

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark small" aria-hidden="true">CM</span>
          <div><strong>Cover Match</strong><span>Admin studio</span></div>
        </div>
        <AdminNav />
        <div className="sidebar-foot">
          <p>Week 7 control room</p>
          <span>Every route and mutation rechecks superadmin access.</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="topbar">
          <div>
            <span className="mobile-brand">Cover Match Admin</span>
          </div>
          <div className="admin-identity">
            <span className="avatar">{name.charAt(0).toUpperCase()}</span>
            <span><strong>{name}</strong><small>{user.email}</small></span>
            <form action={signOut}><button className="text-button" type="submit">Sign out</button></form>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
