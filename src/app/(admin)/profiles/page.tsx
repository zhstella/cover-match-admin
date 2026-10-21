import { getProfiles } from "@/lib/admin-data";

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <>
      <section className="page-heading"><div><p className="eyebrow">Identity directory</p><h1>Profiles</h1><p>Read-only account and community profile information.</p></div><span className="count-pill">{profiles.length} profiles</span></section>
      <section className="panel table-panel">
        <div className="table-wrap"><table><thead><tr><th>Reader</th><th>Role</th><th>Joined</th><th>Last sign-in</th><th>Profile ID</th></tr></thead>
          <tbody>{profiles.map((profile) => {
            const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Profile incomplete";
            return <tr key={profile.id}><td><div className="reader-cell"><span className="avatar">{name.charAt(0).toUpperCase()}</span><span><strong>{name}</strong><small>{profile.email}</small></span></div></td><td><span className={profile.is_superadmin ? "role-badge admin" : "role-badge"}>{profile.is_superadmin ? "Superadmin" : "Reader"}</span></td><td>{formatDate(profile.created_at)}</td><td>{formatDate(profile.lastSignInAt)}</td><td><code className="id-code">{profile.id.slice(0, 8)}…</code></td></tr>;
          })}</tbody></table></div>
      </section>
    </>
  );
}
