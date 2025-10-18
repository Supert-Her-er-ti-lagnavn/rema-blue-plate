import remaLogo from "@/assets/rema-logo.png";

export const Hero = () => {
  return (
    <div className="relative bg-primary text-primary-foreground py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src={remaLogo} 
            alt="REMA 1000 - Alltid lave priser" 
            className="h-24 md:h-32 w-auto"
          />
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
          Meal Planner
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/95 max-w-2xl mx-auto font-semibold">
          Plan your week, save money, eat well
        </p>
      </div>
    </div>
  );
};
