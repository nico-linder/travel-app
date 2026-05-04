import { Atlas, Fonts as AtlasFonts } from './atlas';

// React Navigation expects this Colors shape. Atlas is a dark-only product —
// both schemes resolve to the same editorial-dusk palette so screens look
// consistent regardless of the device's color scheme.
const palette = {
  text: Atlas.paper,
  background: Atlas.ink,
  tint: Atlas.amber,
  icon: Atlas.paperMute,
  tabIconDefault: Atlas.paperMute,
  tabIconSelected: Atlas.amber,
};

export const Colors = {
  light: palette,
  dark:  palette,
};

export const Fonts = AtlasFonts;

export { Atlas };
