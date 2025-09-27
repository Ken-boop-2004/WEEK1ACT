import { View, type ViewProps } from 'react-native';
import { getThemeColors } from '../constants/Colors';
import { useAppSelector } from '../store/hooks';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  customColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, customColor, ...otherProps }: ThemedViewProps) {
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);
  
  let backgroundColor = colors.background;
  
  if (customColor) {
    backgroundColor = customColor;
  } else if (mode === 'light' && lightColor) {
    backgroundColor = lightColor;
  } else if (mode === 'dark' && darkColor) {
    backgroundColor = darkColor;
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
