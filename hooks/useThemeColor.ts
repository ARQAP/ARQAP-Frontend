/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Colors is a simple map of color names -> hex strings.
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme as "light" | "dark"];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[colorName];
  }
}
