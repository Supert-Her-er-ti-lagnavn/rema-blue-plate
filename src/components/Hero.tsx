import { Utensils } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-blue-700 to-blue-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Utensils className="w-10 h-10" strokeWidth={2.5} />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase" style={{ letterSpacing: '-0.02em' }}>
            Blue Plate
          </h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-tight">
          Meal Planner
        </h2>
        <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto font-semibold">
          Plan your week, save money, eat well
        </p>
      </div>
    </div>
  );
};
