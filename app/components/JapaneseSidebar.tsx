import React from "react";

export default function JapaneseSidebar() {
  return (
    <div className="hidden md:flex w-16 flex-col items-center justify-center border-r border-gray-800 bg-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full bg-[repeating-linear-gradient(45deg,#000_0px,#000_7px,#1C1C1F_7px,#1C1C1F_8px)] opacity-50 z-0"></div>

      {/* Text Container */}
      <div className="z-10 bg-krakedblue/20 text-krakedlight py-8 px-1 font-serif font-bold text-2xl tracking-widest writing-vertical-rl text-orientation-upright border-y-2 border-gray-400/40">
        <span className="block mb-4">一緒に</span>
        <span className="block">勉強しましょう</span>
      </div>
    </div>
  );
}
