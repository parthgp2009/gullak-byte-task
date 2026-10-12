import React from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TabType } from '../types';
import { useTheme } from '../hooks/useTheme';
import { borderRadius, spacing, fontFamilies, colors } from '../theme';

interface SegmentedControlProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = React.useState(0);
  const slideAnim = useSharedValue(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth(width);
  };

  const handleSelect = (tab: TabType) => {
    if (tab === activeTab) return;
    Haptics.selectionAsync().catch(() => {});
    onChangeTab(tab);
    slideAnim.value = withTiming(tab === 'active' ? 0 : 1, { duration: 250 });
  };

  React.useEffect(() => {
    slideAnim.value = withTiming(activeTab === 'active' ? 0 : 1, { duration: 250 });
  }, [activeTab, slideAnim]);

  const segmentWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: slideAnim.value * segmentWidth,
        },
      ],
      width: segmentWidth,
    };
  });

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Animated Sliding Background Indicator with 1px Terracotta Outline */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.animatedIndicator,
            indicatorStyle,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: colors.terracotta,
            },
          ]}
        />
      )}

      {/* "Active" Tab */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelect('active')}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityLabel="Active items tab"
        accessibilityState={{ selected: activeTab === 'active' }}
      >
        <Feather
          name="inbox"
          size={15}
          color={activeTab === 'active' ? colors.terracotta : theme.textMuted}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: activeTab === 'active' ? colors.cream : theme.textMuted,
              fontFamily: activeTab === 'active' ? fontFamilies.sansSemiBold : fontFamilies.sans,
            },
          ]}
        >
          Active
        </Text>
      </TouchableOpacity>

      {/* "Archived" Tab */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelect('archived')}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityLabel="Archived items tab"
        accessibilityState={{ selected: activeTab === 'archived' }}
      >
        <Feather
          name="archive"
          size={15}
          color={activeTab === 'archived' ? colors.terracotta : theme.textMuted}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: activeTab === 'archived' ? colors.cream : theme.textMuted,
              fontFamily: activeTab === 'archived' ? fontFamilies.sansSemiBold : fontFamilies.sans,
            },
          ]}
        >
          Archived
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.iconBtn + 2, // ~14px
    borderWidth: 1,
    padding: 3,
    position: 'relative',
    height: 44,
  },
  animatedIndicator: {
    position: 'absolute',
    top: 3,
    left: 4,
    bottom: 3,
    borderRadius: borderRadius.chip, // 10px
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 14,
  },
});
