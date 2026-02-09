import { NavLink } from "react-router";
import Button from "../ui/Button";
import { Link } from "../ui/Link";

export function NavBar() {
  return (
    <nav className="flex px-4 justify-between items-center bg-white sticky left-0 right-0 top-0 z-10 border-b-2 border-gray-100">
      <div className="flex justify-center items-center">
        <img
          className="w-auto h-16 rounded-full"
          src="./GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="flex items-center gap-2">
        <Link
          className={"bg-cyan-600 text-white rounded text-xs md:text-base"}
          route={"/auth/login"}
        >
          Login
        </Link>
        <Link
          className={"bg-cyan-600 text-white rounded text-xs md:text-base"}
          route={"/auth/signup"}
        >
          Signup
        </Link>
      </div>
    </nav>
  );
}
