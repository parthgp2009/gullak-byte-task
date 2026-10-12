import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ItemForm } from '../../src/components/ItemForm';
import { useItems } from '../../src/hooks/useItems';
import { useTheme } from '../../src/hooks/useTheme';

export default function NewItemScreen() {
  const router = useRouter();
  const { addItem } = useItems();
  const { theme } = useTheme();

  const handleSave = async (data: {
    type: Parameters<typeof addItem>[0]['type'];
    title: string;
    content: string;
    url?: string;
    imageUri?: string;
    tags: string[];
    archived?: boolean;
  }) => {
    await addItem({
      ...data,
      archived: data.archived ?? false,
    });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ItemForm onSave={handleSave} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
