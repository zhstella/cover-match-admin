import { signInWithGoogle } from "@/app/auth/actions";

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark" aria-hidden="true">CM</div>
        <p className="eyebrow">Cover Match · Staff only</p>
        <h1>Keep the community shelf in good shape.</h1>
        <p className="login-copy">
          Sign in with Google. Access is granted only when your profile is marked as a superadmin.
        </p>
        <form action={signInWithGoogle}>
          <button className="button button-primary button-wide" type="submit">
            <span aria-hidden="true">G</span>
            Continue with Google
          </button>
        </form>
        <div className="security-note">
          <span aria-hidden="true">⌁</span>
          Authentication and database authorization are checked separately.
        </div>
      </section>
      <aside className="login-art" aria-hidden="true">
        <div className="art-window" />
        <div className="art-book book-one" />
        <div className="art-book book-two" />
        <div className="art-book book-three" />
        <div className="art-leaf leaf-one" />
        <div className="art-leaf leaf-two" />
        <p>Editorial control,<br />quietly protected.</p>
      </aside>
    </main>
  );
}
