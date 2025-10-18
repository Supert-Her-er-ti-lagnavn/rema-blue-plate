import React, {useEffect, useMemo, useRef, useState} from "react";
import { ShoppingCart, Calendar, Refrigerator } from "lucide-react";
import { motion } from "framer-motion";

/**
 * A11y + keyboard friendly segmented control with an animated pill indicator.
 * - Accurate indicator width/position (measures the active button)
 * - Works with variable label widths and on resize
 * - Arrow-key navigation + roving tabindex
 * - Icons + optional tooltips
 */

export type ModeType = "planning" | "shopping" | "fridge";

export interface ToggleShoppingProps {
  onToggle?: (mode: ModeType) => void;
  initialMode?: ModeType;
  className?: string;
}

const MODES: Array<{ key: ModeType; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>>; tooltip?: string }>
  = [
    { key: "planning", label: "Meal Plan", Icon: Calendar, tooltip: "Plan your weekly meals" },
    { key: "shopping", label: "Shopping", Icon: ShoppingCart, tooltip: "Manage your shopping list" },
    { key: "fridge",   label: "Fridge",   Icon: Refrigerator, tooltip: "View & manage fridge items" },
  ];

export const SegmentedToggle: React.FC<ToggleShoppingProps> = ({
  onToggle,
  initialMode = "planning",
  className = "",
}) => {
  const [current, setCurrent] = useState<ModeType>(initialMode);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Colors per mode
  const colors = useMemo(() => ({
    planning: "from-blue-500 to-blue-600",
    shopping: "from-emerald-500 to-emerald-600",
    fridge:   "from-amber-400 to-amber-500",
  }), []);

  // Measure active button to position the pill accurately
  const measure = () => {
    const activeIdx = MODES.findIndex(m => m.key === current);
    const btn = btnRefs.current[activeIdx];
    const track = trackRef.current;
    if (!btn || !track) return;
    const { left: trackLeft } = track.getBoundingClientRect();
    const { left, width } = btn.getBoundingClientRect();
    setIndicator({ left: left - trackLeft, width });
  };

  useEffect(() => {
    measure();
    const obs = new ResizeObserver(measure);
    if (trackRef.current) obs.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const setMode = (mode: ModeType) => {
    setCurrent(mode);
    onToggle?.(mode);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = MODES.findIndex(m => m.key === current);
    const next = e.key === "ArrowRight" ? (idx + 1) % MODES.length : (idx - 1 + MODES.length) % MODES.length;
    setMode(MODES[next].key);
    btnRefs.current[next]?.focus();
  };

  const statusBadge = useMemo(() => (
    current === "planning" ? { text: "Planning Mode",  cls: "text-blue-700 bg-blue-100" } :
    current === "shopping" ? { text: "Shopping Mode",  cls: "text-emerald-700 bg-emerald-100" } :
                              { text: "Fridge Mode",    cls: "text-amber-700 bg-amber-100" }
  ), [current]);

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-1/2 max-w-md px-3 ${className}`}>
      <div
        ref={containerRef}
        className="relative mx-auto w-full rounded-full border border-gray-200 bg-white/95 backdrop-blur-sm p-1 shadow-lg"
        role="tablist"
        aria-label="Mode switcher"
        onKeyDown={onKeyDown}
      >
        {/* Track */}
        <div ref={trackRef} className="relative flex w-full gap-1 rounded-full bg-gray-100 p-1 overflow-hidden">
          {/* Animated indicator */}
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 h-10 rounded-full shadow-md bg-gradient-to-r ${colors[current]}`}
            animate={{ left: indicator.left, width: indicator.width }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          />

          {MODES.map((m, i) => (
            <button
              key={m.key}
              ref={el => btnRefs.current[i] = el}
              role="tab"
              aria-selected={current === m.key}
              aria-controls={`panel-${m.key}`}
              title={m.tooltip}
              onClick={() => setMode(m.key)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                current === m.key
                  ? "text-white [text-shadow:0_1px_0_rgba(0,0,0,0.15)]"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <m.Icon width={18} height={18} className={m.key === "fridge" && current !== m.key ? "text-amber-600" : undefined} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SegmentedToggle;