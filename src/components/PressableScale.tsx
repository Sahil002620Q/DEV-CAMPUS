import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const APressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({ style, ...props }: PressableProps) {
  const s = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }]
  }));

  return (
    <APressable
      {...props}
      onPressIn={(e) => {
        s.value = withSpring(0.98, { damping: 18, stiffness: 260 });
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withSpring(1, { damping: 18, stiffness: 260 });
        props.onPressOut?.(e);
      }}
      style={[style as any, animatedStyle]}
    />
  );
}

