import StatsChart from "./components/StatsChart";
import StatsPage from "./stats/page";
import Timer from "./timer/page";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <section className="relative z-10 p-10">
        <div className="flex gap-8 items-start">
          <Timer />
        </div>
      </section>
    </main>
  );
}
