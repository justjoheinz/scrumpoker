'use client';

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <footer className="page-footer teal lighten-1">
      <div className="footer-content center-align">
        <span className="grey-text text-lighten-3">
          Scrum Poker v{version}
        </span>
      </div>
    </footer>
  );
}
