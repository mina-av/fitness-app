import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { SPACING } from '@/lib/constants';

import { EmptyState } from './EmptyState';
import { TextField } from './TextField';

export interface SearchableSelectListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  getSearchableText: (item: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

/** Generische, selbstfilternde Auswahlliste — z.B. für den Übungs-Picker in Trainingsplänen. */
export function SearchableSelectList<T>({
  items,
  keyExtractor,
  renderItem,
  getSearchableText,
  searchPlaceholder = 'Suchen …',
  emptyMessage = 'Keine Treffer.',
}: SearchableSelectListProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(term));
  }, [items, query, getSearchableText]);

  return (
    <View style={styles.container}>
      <TextField
        placeholder={searchPlaceholder}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
      />
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <>{renderItem(item)}</>}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState title={emptyMessage} />}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: SPACING.md,
  },
  listContent: {
    paddingVertical: SPACING.sm,
  },
});
