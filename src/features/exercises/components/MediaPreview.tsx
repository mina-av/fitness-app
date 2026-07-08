import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/lib/constants';

export interface MediaPreviewProps {
  mediaUrl: string | null;
}

/**
 * Zeigt die hinterlegte Medien-URL als Bild/GIF. Schlägt das fehl (ungültige
 * URL oder z.B. ein Video-Link, den <Image> nicht dekodieren kann), wird ein
 * Fallback mit "Im Browser öffnen" angezeigt statt die App abstürzen zu lassen.
 */
export function MediaPreview({ mediaUrl }: MediaPreviewProps) {
  const [failed, setFailed] = useState(false);

  if (!mediaUrl) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Kein Vorschaubild hinterlegt</Text>
      </View>
    );
  }

  if (failed) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Vorschau nicht verfügbar</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(mediaUrl)} hitSlop={8}>
          <Text style={styles.link}>Im Browser öffnen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: mediaUrl }}
      style={styles.media}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  media: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  link: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
