import { create } from "zustand";

interface GlowState {
  glowColor: string;
  setGlowColor: (color: string) => void;
}

export const useGlowStore = create<GlowState>((set) => ({
  glowColor: "#26AFE0", // Light sky blue glow
  setGlowColor: (color) => set({ glowColor: color }),
}));
