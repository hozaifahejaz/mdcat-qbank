/* Shown when the sign-in API is unreachable or no sign-in method is switched on yet (see docs/auth-setup.md). */
export default function NotConfigured() {
  return (
    <div className="center-state">
      <div className="card state-card">
        <h1>Accounts open soon</h1>
        <p className="muted">Sign-up isn&apos;t switched on yet. In the meantime you can try sample questions on the home page.</p>
        <a className="pill pill-dark" href="/#try">Try a question</a>
      </div>
    </div>
  );
}
