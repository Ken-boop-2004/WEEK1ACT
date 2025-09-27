import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { getThemeColors } from '../constants/Colors';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setThemeMode } from '../store/themeSlice';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const dispatch = useAppDispatch();
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  const animationValue = useSharedValue(mode === 'dark' ? 1 : 0);
  const scaleValue = useSharedValue(1);

  React.useEffect(() => {
    animationValue.value = withSpring(mode === 'dark' ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [mode]);

  const handleToggle = () => {
    scaleValue.value = withSpring(0.8, { damping: 10 }, () => {
      scaleValue.value = withSpring(1, { damping: 10 });
    });

    const newMode = mode === 'light' ? 'dark' : 'light';
    dispatch(setThemeMode(newMode));
  };

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationValue.value,
      [0, 1],
      [colors.surface, colors.background]
    );

    const borderColor = interpolateColor(
      animationValue.value,
      [0, 1],
      [colors.primary, colors.accent]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scaleValue.value }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const rotate = animationValue.value * 180;
    const opacity = animationValue.value;
    
    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity: withTiming(opacity, { duration: 300 }),
    };
  });

  const sunIconAnimatedStyle = useAnimatedStyle(() => {
    const rotate = (1 - animationValue.value) * 180;
    const opacity = 1 - animationValue.value;
    
    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity: withTiming(opacity, { duration: 300 }),
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, animatedStyle]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Animated.View style={[styles.iconWrapper, sunIconAnimatedStyle]}>
          <Ionicons
            name="sunny"
            size={size}
            color={colors.primary}
          />
        </Animated.View>
        <Animated.View style={[styles.iconWrapper, iconAnimatedStyle]}>
          <Ionicons
            name="moon"
            size={size}
            color={colors.accent}
          />
        </Animated.View>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
