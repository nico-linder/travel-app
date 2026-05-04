import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#818cf8'; // Indigo-400

export const Colors = {
  light: {
    text: '#171717',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ededed', // foreground from globals.css
    background: '#0a0a0a', // background from globals.css
    tint: tintColorDark,
    icon: '#94a3b8', 
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    // Exact Geist/Vercel stack
    sans: "Geist, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "system-ui",
    mono: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
