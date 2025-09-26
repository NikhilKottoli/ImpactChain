import { useEffect } from "react";
import { initLenis } from "./utils/lenis";
import { Outlet } from "react-router-dom";

import { setupLenisGSAP } from "@/utils/gsap";
import "lenis/dist/lenis.css";

export default function App() {
  useEffect(() => {
    const lenis = initLenis();

    // Setup Lenis with GSAP ScrollTrigger using the recommended method
    setupLenisGSAP(lenis);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="pb-32 lg:pt-32 lg:pb-0 pt-0 h-full">
      <Outlet />
    </div>
  );
}
