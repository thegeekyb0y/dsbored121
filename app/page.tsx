import Timer from "./timer/page";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <section className="relative z-10 p-10">
        <div className="flex gap-2">
          <Timer />
        </div>
      </section>
    </main>
  );
}
