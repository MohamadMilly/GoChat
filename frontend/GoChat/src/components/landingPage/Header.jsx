import { Link } from "../ui/Link";
import chatBackground from "../../assets/chat_background.png";
export default function Header() {
  return (
    <header
      className="flex min-h-150 px-4 pt-10 items-center flex-col relative"
      style={{ backgroundImage: `url(${chatBackground})` }}
    >
      <div className="inset-0 bg-gray-800/60 absolute backdrop-blur-xs"></div>
      <div className="flex justify-center items-center -mb-6 z-5">
        <img
          className="rounded-full w-auto max-h-60 md:max-h-80 brightness-150"
          src="GoChat_logo.png"
          alt="GoChat logo"
        />
      </div>
      <div className="z-5 flex flex-col items-center">
        <h1 className="text-gray-100 font-medium tracking-tight md:text-6xl text-5xl mb-4 font-rubik">
          Send,recieve and reply in a{" "}
          <span className="font-bold text-cyan-400">blink</span>
        </h1>
        <p className="text-gray-200 text-center text-lg">
          Let your thoughts flow in a real-time conversation
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            className={"bg-cyan-600 text-white rounded"}
            route={"/auth/login"}
          >
            Login
          </Link>
          <Link
            className={"bg-cyan-600 text-white rounded"}
            route={"/auth/signup"}
          >
            Signup
          </Link>
        </div>
      </div>
    </header>
  );
}
