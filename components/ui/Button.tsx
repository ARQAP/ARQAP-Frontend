import React from "react";
import { Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  textClassName?: string;
}

export default function Button({
  title,
  onPress,
  style,
  textStyle,
  className,
  textClassName,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={
        className ? className : "bg-[#6B705C] rounded-lg py-3 items-center mb-4"
      }
      style={style}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text
        className={textClassName ? textClassName : "text-white text-[16px]"}
        style={textStyle}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
