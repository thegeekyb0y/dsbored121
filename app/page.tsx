import { AppBar } from "./components/AppBar";
import TestStopwatch from "./components/Stopwatch";
import Timer from "./timer/page";

export default function Home() {
  return (
    <main>
      <AppBar />
      <div className="flex gap-2 justify-between items-start">
        <Timer />
        <TestStopwatch />
      </div>
    </main>
  );
}
