import { AppBar } from "./components/AppBar";
import { Timer } from "./timer/page";

export default function Home() {
  return (
    <main>
      <AppBar />
      <Timer />
    </main>
  );
}
