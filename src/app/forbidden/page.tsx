import { signOut } from "@/app/auth/actions";

export default function ForbiddenPage() {
  return (
    <main className="state-page">
      <div className="state-card">
        <span className="state-icon" aria-hidden="true">⌁</span>
        <p className="eyebrow">Signed in · Access not granted</p>
        <h1>This account is not a superadmin.</h1>
        <p>
          Your Google identity was verified, but the matching profile does not have
          <code> is_superadmin = true</code>.
        </p>
        <form action={signOut}>
          <button className="button button-secondary" type="submit">Sign out</button>
        </form>
      </div>
    </main>
  );
}
