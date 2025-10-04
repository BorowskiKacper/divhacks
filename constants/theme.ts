/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Figma color variables
const darkGreen = '#036400';
const lightGreen = '#849A70';
const lightText = '#DADFBC';
const darkText = '#211717';

export const Colors = {
  light: {
    text: darkText, // Dark Text for light mode
    background: lightText, // Light Text as background
    tint: darkGreen, // Dark Green as primary tint
    icon: darkText, // Dark Text for icons
    tabIconDefault: lightGreen, // Light Green for default tab icons
    tabIconSelected: darkGreen, // Dark Green for selected tab icons
    primary: darkGreen, // Dark Green for primary elements
    secondary: lightGreen, // Light Green for secondary elements
    accent: lightText, // Light Text for accents
  },
  dark: {
    text: lightText, // Light Text for dark mode
    background: darkGreen, // Dark Green as background
    tint: lightText, // Light Text as primary tint
    icon: lightText, // Light Text for icons
    tabIconDefault: lightGreen, // Light Green for default tab icons
    tabIconSelected: lightText, // Light Text for selected tab icons
    primary: lightText, // Light Text for primary elements
    secondary: lightGreen, // Light Green for secondary elements
    accent: darkGreen, // Dark Green for accents
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
