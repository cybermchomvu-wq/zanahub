import { ArrowLeft, UserRound } from 'lucide-react';

export function AccountDashboard({
  currentUser,
  accountDetails,
  onBack,
}) {
  const account = accountDetails || currentUser || {};

  const joined = account.created_at
    ? new Date(account.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <section className="account-dashboard">
      <button className="dashboard-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to tools
      </button>

      <div className="dashboard-heading">
        <span className="dashboard-eyebrow">ZANAHUB ACCOUNT</span>
        <h1>My Workspace</h1>
        <p>Your account details and workspace.</p>
      </div>

      <div className="account-profile-card">
        <div className="account-profile-avatar">
          {(account.name || account.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="account-profile-copy">
          <h2>{account.name || 'ZanaHub user'}</h2>
          <p>{account.email || 'Email unavailable'}</p>
        </div>
      </div>

      <div className="dashboard-info-grid">
        <article className="dashboard-info-card">
          <span className="dashboard-card-label">ACCOUNT STATUS</span>
          <h3>Ready to use</h3>
          <p>Your ZanaHub workspace is available.</p>
        </article>

        <article className="dashboard-info-card">
          <span className="dashboard-card-label">MEMBER SINCE</span>
          <h3>{joined}</h3>
          <p>Your account creation date.</p>
        </article>
      </div>

      <div className="dashboard-info-card">
        <UserRound size={22} />
        <h3>Welcome to ZanaHub</h3>
        <p>Explore the available tools from your workspace.</p>
      </div>
    </section>
  );
}
