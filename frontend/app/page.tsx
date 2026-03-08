import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-3xl">
        {/* Badge */}
        <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium tracking-wide">
          GeoPulse Fiber AI
        </span>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
          Predict Fiber<br />Failures Before<br />They Happen.
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed">
          An ML-powered GIS platform that scores every fiber segment across Tamil Nadu — in real-time.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors duration-200 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-blue-900/40"
        >
          Launch Dashboard
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Fiber Segments", value: "50+" },
            { label: "Model Accuracy", value: "~87%" },
            { label: "Risk Levels", value: "3-Tier" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-blue-400">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
