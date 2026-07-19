

export function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F17] text-white">
      <h1 className="text-5xl font-outfit font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
        APEX
      </h1>
      <p className="text-slate-400 font-inter text-lg">
        Decision Intelligence & Shadow Simulation Engine
      </p>
      <div className="mt-8 flex gap-4">
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-sm font-mono">
          System Nominal
        </span>
      </div>
    </div>
  );
}
