import { Link } from "react-router-dom";

export default function IconCard({ to, state, icon: Icon, title }) {
  return (
    <Link
      to={to}
      state={state}
      className="icon-card"
      aria-label={title}
    >
      <span className="icon-card__icon">
        {Icon ? <Icon size={28} aria-hidden /> : null}
      </span>
      <span className="icon-card__title">{title}</span>
    </Link>
  );
}
