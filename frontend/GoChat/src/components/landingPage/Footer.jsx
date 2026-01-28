import { Link } from "../ui/Link";
export default function Footer() {
  return (
    <footer className="min-h-75 bg-cyan-600 p-6 mt-12 flex flex-col">
      <div className="flex justify-start">
        <img
          className="w-24 h-auto brightness-150 ml-[calc(50%-240px)]"
          src={"./GoChat_logo.png"}
          alt="GoChat logo"
        />
      </div>
      <div className="flex justify-between w-full max-w-120 mx-auto shrink-0 mt-6 border-2 border-cyan-500 rounded-md p-3">
        <Link route={"/about"} className="text-white text-lg">
          About me
        </Link>
        <Link
          route={"https://t.me/Mohamadmilly"}
          className="text-white text-lg"
        >
          Contact
        </Link>
      </div>
      <p className="mt-auto text-center text-gray-200 text-sm">
        GoChat | {new Date().getFullYear()}
      </p>
    </footer>
  );
}
