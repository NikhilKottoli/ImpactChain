import { useGlowStore } from "@/stores/glowStore";
import { oklch, parse, formatHex } from "culori";
import { motion, AnimatePresence } from "framer-motion";

export default function BgDynamic({ children }) {
  const { glowColor } = useGlowStore();

  // Convert the reference color (#26AFE0) to OKLCH
  const referenceOklch = oklch(parse("#26AFE0"));

  // Convert the incoming color to OKLCH
  const incomingOklch = oklch(parse(glowColor));

  // Create a new color that has the hue of the incoming color but luminosity and chroma of reference
  const adjustedOklch = {
    mode: "oklch",
    l: referenceOklch.l,
    c: referenceOklch.c,
    h: incomingOklch.h,
  };

  // Convert back to hex
  const adjustedHex = formatHex(adjustedOklch);

  const bgStyle = {
    background: `radial-gradient(125% 125% at 50% 80%, #FBF3F0 40%, ${adjustedHex} 100%)`,
  };

  return (
    <motion.div
      className="absolute inset-0 -z-10 h-full w-full bg-[#FBF3F0]"
      style={bgStyle}
      initial={false}
      animate={{ background: bgStyle.background }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
