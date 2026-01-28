import { Link } from "../components/ui/Link";

export function About() {
  return (
    <main className="max-w-200 mx-auto p-6">
      <h2 className="font-rubik text-4xl text-cyan-600 font-bold text-center my-12">
        About the creator
      </h2>
      <article>
        <p className="text-lg text-gray-800">
          Welcome to my web app! I’m Mohammed Milly, a Syrian web developer and
          mathematician with a passion for logic and problem‑solving. I love
          exploring ideas that challenge the mind and spark creative thinking.
          If you’d like to connect, you can reach me on Telegram, and don’t
          forget to check out my GitHub for more projects I’ve built. I hope you
          enjoy exploring my work!
        </p>
        <aside className="flex justify-between w-full max-w-120 mx-auto shrink-0 mt-6 border-2 border-cyan-500 rounded-md p-3">
          <Link
            route={"https://github.com/MohamadMilly"}
            className="text-cyan-600 text-lg"
          >
            github account
          </Link>
          <Link
            route={"https://t.me/Mohamadmilly"}
            className="text-cyan-600 text-lg"
          >
            telegram account
          </Link>
        </aside>
      </article>
    </main>
  );
}
