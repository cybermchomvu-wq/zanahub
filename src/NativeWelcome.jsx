import './NativeWelcome.css';

export default function NativeWelcome() {
  return (
    <main className="native-welcome-screen" aria-label="Welcome to ZanaHub">
      <div className="native-welcome-glow native-welcome-glow-one" />
      <div className="native-welcome-glow native-welcome-glow-two" />

      <div className="native-welcome-content">
        <div className="native-welcome-icon-area">
          <div className="native-welcome-ring native-welcome-ring-one" />
          <div className="native-welcome-ring native-welcome-ring-two" />

          <div className="native-welcome-icon-frame">
            <img
              className="native-welcome-icon"
              src="/zanahub-icon.svg"
              alt="ZanaHub app icon"
            />
          </div>
        </div>

        <h1 className="native-welcome-title">ZANAHUB</h1>

        <div className="native-welcome-divider" />

        <p className="native-welcome-credit">
          DEVELOPED BY <strong>sajultds</strong>
        </p>

        <div className="native-welcome-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="native-welcome-loading" role="status">
          Preparing your workspace...
        </p>
      </div>
    </main>
  );
}
