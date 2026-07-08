import type { MuscleGroup } from '@/db/schema';

// Siehe docs/design-system.md für die Design-Entscheidung dahinter.
export const COLORS = {
  background: '#0B0F14',
  surface: '#151B23',
  surfaceElevated: '#1E2733',
  border: '#2A3441',
  textPrimary: '#F5F7FA',
  textSecondary: '#9AA7B5',
  accent: '#3B82F6',
  accentMuted: '#1D3A63',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  card: 12,
  pill: 999,
  modal: 16,
} as const;

export const TYPOGRAPHY = {
  title: { fontSize: 22, fontWeight: '600' as const },
  subtitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
  },
};

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'brust', label: 'Brust' },
  { value: 'beine', label: 'Beine' },
  { value: 'ruecken', label: 'Rücken' },
  { value: 'schultern', label: 'Schultern' },
  { value: 'arme', label: 'Arme' },
  { value: 'core', label: 'Core' },
];

export const EQUIPMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'langhantel', label: 'Langhantel' },
  { value: 'kurzhantel', label: 'Kurzhantel' },
  { value: 'maschine', label: 'Maschine' },
  { value: 'kabelzug', label: 'Kabelzug' },
  { value: 'koerpergewicht', label: 'Körpergewicht' },
  { value: 'sonstiges', label: 'Sonstiges' },
];
