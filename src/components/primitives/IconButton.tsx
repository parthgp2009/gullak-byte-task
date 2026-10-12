import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { useTheme } from '../../hooks/useTheme';
import { borderRadius } from '../../theme';

interface IconButtonProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  iconSize = 18,
  color,
  backgroundColor,
  accessibilityLabel,
  style,
  active = false,
}) => {
  const { theme } = useTheme();

  const iconColor = color || (active ? theme.accent : theme.text);
  const bgColor = backgroundColor || (active ? theme.surfaceSecondary : 'transparent');
  const borderColor = active ? theme.borderActive : theme.border;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: borderRadius.iconBtn,
          backgroundColor: bgColor,
          borderColor: borderColor,
        },
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={iconColor} />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
