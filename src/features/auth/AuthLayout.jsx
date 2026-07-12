export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-split">
      <div className="auth-brand">
        <span className="auth-orb" style={{ width: 300, height: 300, background: '#fff', top: -80, right: -60 }} />
        <span className="auth-orb" style={{ width: 240, height: 240, background: '#000', bottom: -70, left: -40 }} />
        <div className="auth-brand-inner">
          <div className="brand" style={{ padding: 0, cursor: 'default' }}>
            <span className="brand-mark" style={{ background: 'rgba(255,255,255,.2)' }}>L</span>
            <span className="brand-name">Linkosting</span>
          </div>
          <h2>Post with less effort.</h2>
          <p>Draft in your voice, schedule a week ahead, and let approval-by-email keep you fully in control of what goes live.</p>
          <ul className="auth-points">
            <li>Three AI drafts from one idea</li>
            <li>Schedule posts on a calendar</li>
            <li>Nothing publishes without your OK</li>
          </ul>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card screen">
          <div className="brand" style={{ padding: '0 0 18px', cursor: 'default', justifyContent: 'flex-start' }}>
            <span className="brand-mark">L</span>
            <span className="brand-name">Linkosting</span>
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="muted" style={{ margin: '6px 0 20px' }}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
