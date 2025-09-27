import { StyleSheet, Text, type TextProps } from 'react-native';
import { getThemeColors } from '../constants/Colors';
import { useAppSelector } from '../store/hooks';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  customColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  customColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);
  
  let color = colors.text;
  
  if (customColor) {
    color = customColor;
  } else if (mode === 'light' && lightColor) {
    color = lightColor;
  } else if (mode === 'dark' && darkColor) {
    color = darkColor;
  } else if (type === 'link') {
    color = colors.primary;
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
