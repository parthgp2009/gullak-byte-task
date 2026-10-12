import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './primitives/PressableScale';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors, shadows } from '../theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View
          style={[
            styles.dialogContainer,
            shadows.modal,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDestructive ? theme.dangerBg : theme.surfaceSecondary,
                },
              ]}
            >
              <Feather
                name={isDestructive ? 'trash-2' : 'alert-circle'}
                size={20}
                color={isDestructive ? theme.danger : colors.terracotta}
              />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <PressableScale
              onPress={onConfirm}
              haptic="medium"
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor: isDestructive ? theme.danger : colors.terracotta,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>
                {confirmLabel}
              </Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: borderRadius.card, // radius 20
    borderWidth: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.iconBtn,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  message: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button, // radius 10
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
  confirmButton: {},
  confirmText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 14,
  },
});
