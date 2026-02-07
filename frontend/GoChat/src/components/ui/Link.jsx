import { NavLink } from "react-router";

export function Link({ children, route, className = "rounded-md" }) {
  return (
    <NavLink
      viewTransition={true}
      to={route}
      className={`text-sm px-3 py-1.5  hover:scale-105 shadow transition-all duration-300 ${className}`}
    >
      {children}
    </NavLink>
  );
}
