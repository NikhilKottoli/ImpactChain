import Lenis from "lenis";

export const initLenis = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easing
    smoothWheel: true,
    // smoothTouch: false,
  });

  return lenis;
};
