import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ItemForm } from '../../../src/components/ItemForm';
import { EmptyState } from '../../../src/components/EmptyState';
import { useItems } from '../../../src/hooks/useItems';
import { useTheme } from '../../../src/hooks/useTheme';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getItemById, updateItem } = useItems();
  const { theme } = useTheme();

  const item = getItemById(id || '');

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          type="notFound"
          onActionPress={() => router.replace('/')}
          actionLabel="Return to Gullak"
        />
      </View>
    );
  }

  const handleSave = async (data: {
    type: typeof item.type;
    title: string;
    content: string;
    url?: string;
    imageUri?: string;
    tags: string[];
    archived?: boolean;
  }) => {
    await updateItem(item.id, data);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ItemForm
        initialItem={item}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditMode
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
