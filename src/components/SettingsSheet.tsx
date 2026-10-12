import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { PressableScale } from './primitives/PressableScale';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

interface SettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({ visible, onClose }) => {
  const { theme, isDark, colorSchemeMode, setScheme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
                  <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                    Drop it in. Find it later.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.closeBtn, { backgroundColor: theme.surfaceSecondary }]}
                  accessibilityLabel="Close settings"
                >
                  <Feather name="x" size={16} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Theme Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  APPEARANCE
                </Text>
                <View
                  style={[
                    styles.themeToggleRow,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {[
                    { mode: 'dark' as const, label: 'Dark', icon: 'moon' as const },
                    { mode: 'light' as const, label: 'Light', icon: 'sun' as const },
                    { mode: 'system' as const, label: 'System', icon: 'smartphone' as const },
                  ].map((item) => {
                    const isSelected = colorSchemeMode === item.mode;
                    return (
                      <PressableScale
                        key={item.mode}
                        onPress={() => setScheme(item.mode)}
                        style={[
                          styles.themeTab,
                          isSelected && [
                            styles.themeTabActive,
                            {
                              backgroundColor: theme.surface,
                              borderColor: theme.border,
                            },
                          ],
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.label} theme`}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Feather
                          name={item.icon}
                          size={15}
                          color={isSelected ? colors.terracotta : theme.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.themeTabText,
                            {
                              color: isSelected ? theme.text : theme.textSecondary,
                              fontFamily: isSelected
                                ? fontFamilies.sansSemiBold
                                : fontFamilies.sans,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              {/* App Info Footer */}
              <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <Text style={[styles.brandText, { color: colors.terracotta }]}>Gullak</Text>
                <Text style={[styles.versionText, { color: theme.textMuted }]}>
                  Version 1.0.0 • Local Vault
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheetContainer: {
    borderRadius: borderRadius.card, // radius 20
    borderWidth: 1,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    fontWeight: '700',
  },
  tagline: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  themeToggleRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.iconBtn,
    borderWidth: 1,
    padding: 3,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.chip,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 40,
  },
  themeTabActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  themeTabText: {
    fontSize: 13,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandText: {
    fontFamily: fontFamilies.serif,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
  },
});
