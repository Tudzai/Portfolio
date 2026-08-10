import {loadFont as loadInter} from "@remotion/google-fonts/Inter";
import {loadFont as loadMono} from "@remotion/google-fonts/IBMPlexMono";
import {loadFont as loadSpace} from "@remotion/google-fonts/SpaceGrotesk";

export const {fontFamily: interFont} = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const {fontFamily: monoFont} = loadMono("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const {fontFamily: displayFont} = loadSpace("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
