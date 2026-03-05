import { NavLink } from "react-router";

export function Link({ children, route, className = "rounded-md" }) {
  return (
    <NavLink
      viewTransition={true}
      to={route}
      className={`text-sm px-3 dark:text-gray-300 py-1.5  hover:scale-105 shadow-xs bg-white dark:bg-gray-700/50 transition-all duration-300 ${className}`}
    >
      {children}
    </NavLink>
  );
}
