import Timer from "./timer/page";

export default function Home() {
  return (
    <main>
      <div className={`flex gap-2`}>
        <Timer />
      </div>
    </main>
  );
}
