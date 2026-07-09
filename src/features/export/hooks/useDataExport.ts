import { useCallback, useState } from 'react';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { db } from '@/db/client';

import { gatherExportPayload } from './repository';

function exportFileName(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `fitness-export-${y}-${m}-${d}.json`;
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportData = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const payload = await gatherExportPayload(db);
      const file = new File(Paths.cache, exportFileName());
      file.write(JSON.stringify(payload, null, 2));

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Trainingsdaten exportieren',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportData, isExporting, error };
}
