import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Sync-freundliche Konventionen (wichtig für spätere Supabase-Anbindung):
//
// 1. IDs sind UUIDs als TEXT, nicht Auto-Increment-Integer.
//    → Auf dem Gerät erzeugte IDs kollidieren nie mit dem Server.
// 2. Jede Tabelle hat createdAt + updatedAt (Unix-Millisekunden).
//    → Der Sync kann fragen: "Was hat sich seit Zeitpunkt X geändert?"
// 3. Löschen ist ein Soft Delete (deletedAt statt DELETE).
//
// UUIDs erzeugst du im Client z.B. mit: Crypto.randomUUID() (expo-crypto)
// ---------------------------------------------------------------------------

const syncColumns = {
  id: text('id').primaryKey(), // UUID
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }), // null = aktiv
};

// --- Übungsbibliothek -------------------------------------------------------
// Vordefinierte Übungen kommen per Seed (isCustom = false), eigene Übungen
// legt der Nutzer an (isCustom = true).

export const exercises = sqliteTable(
  'exercises',
  {
    ...syncColumns,
    name: text('name').notNull(),
    // Kategorien: 'brust' | 'beine' | 'ruecken' | 'schultern' | 'arme' | 'core'
    muscleGroup: text('muscle_group').notNull().$type<MuscleGroup>(),
    // Sekundäre Muskelgruppen, JSON-Array als Text, z.B. '["trizeps","schultern"]'
    secondaryMuscles: text('secondary_muscles'),
    equipment: text('equipment'), // 'langhantel' | 'kurzhantel' | 'maschine' | 'koerpergewicht' | ...
    description: text('description'),
    mediaUrl: text('media_url'), // Video/GIF als URL – KEIN eigenes Hosting im MVP
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(true),
  },
  (t) => [index('idx_exercises_muscle_group').on(t.muscleGroup)],
);

// --- Trainingspläne / Templates ---------------------------------------------
// z.B. "Push Day", "Full Body A". Ein Workout kann aus einem Template gestartet
// werden, bleibt danach aber eigenständig (Template-Änderungen wirken nie
// rückwirkend auf geloggte Workouts).

export const workoutTemplates = sqliteTable('workout_templates', {
  ...syncColumns,
  name: text('name').notNull(), // z.B. "Push", "Pull", "Legs", "Full Body A"
  note: text('note'),
  position: integer('position').notNull().default(0), // Sortierung in der Liste
});

export const templateExercises = sqliteTable(
  'template_exercises',
  {
    ...syncColumns,
    templateId: text('template_id')
      .notNull()
      .references(() => workoutTemplates.id),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(), // Reihenfolge im Plan
    targetSets: integer('target_sets'), // z.B. 3
    targetRepsMin: integer('target_reps_min'), // z.B. 8
    targetRepsMax: integer('target_reps_max'), // z.B. 12
  },
  (t) => [index('idx_template_exercises_template').on(t.templateId, t.position)],
);

// --- Trainingseinheiten -----------------------------------------------------

export const workouts = sqliteTable(
  'workouts',
  {
    ...syncColumns,
    date: integer('date', { mode: 'timestamp_ms' }).notNull(),
    // Optional: aus welchem Template gestartet (nur Referenz, keine Kopplung)
    templateId: text('template_id').references(() => workoutTemplates.id),
    note: text('note'),
    // null solange das Workout läuft; gesetzt beim Abschließen.
    finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
  },
  (t) => [index('idx_workouts_date').on(t.date)],
);

// --- Einzelne Sätze (das Herzstück) ----------------------------------------
// Jeder Satz ist eine eigene Zeile – nie "3x10" als String speichern.
// Nur so funktionieren Volumen-, 1RM-, PR- und Stagnationsanalysen sauber.

export const sets = sqliteTable(
  'sets',
  {
    ...syncColumns,
    workoutId: text('workout_id')
      .notNull()
      .references(() => workouts.id),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    setNumber: integer('set_number').notNull(), // Reihenfolge innerhalb der Übung
    reps: integer('reps').notNull(),
    weightKg: real('weight_kg').notNull(), // 0 für reine Körpergewichtsübungen
    rir: integer('rir'), // Reps in Reserve, optional (0–5+)
    rpe: real('rpe'), // optional, 1–10 (Alternative zu RIR)
    // Satz-Typ: 'normal' | 'dropset' | 'restpause'
    setType: text('set_type').notNull().default('normal').$type<SetType>(),
    // Sätze mit gleicher supersetGroup im selben Workout bilden einen Superset.
    // Wert ist eine frei vergebene Gruppen-ID (z.B. UUID oder "A"/"B").
    supersetGroup: text('superset_group'),
    note: text('note'),
    isWarmup: integer('is_warmup', { mode: 'boolean' }).notNull().default(false), // Aufwärmsätze aus Analyse & PR-Erkennung ausschließen
  },
  (t) => [
    index('idx_sets_workout').on(t.workoutId),
    // Wichtigster Index der App: "Historie einer Übung über die Zeit"
    index('idx_sets_exercise').on(t.exerciseId, t.createdAt),
  ],
);

// --- Relationen (für Drizzle-Queries mit `with`) ----------------------------

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  sets: many(sets),
  template: one(workoutTemplates, {
    fields: [workouts.templateId],
    references: [workoutTemplates.id],
  }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  sets: many(sets),
  templateExercises: many(templateExercises),
}));

export const workoutTemplatesRelations = relations(workoutTemplates, ({ many }) => ({
  exercises: many(templateExercises),
  workouts: many(workouts),
}));

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  template: one(workoutTemplates, {
    fields: [templateExercises.templateId],
    references: [workoutTemplates.id],
  }),
  exercise: one(exercises, {
    fields: [templateExercises.exerciseId],
    references: [exercises.id],
  }),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workout: one(workouts, {
    fields: [sets.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [sets.exerciseId],
    references: [exercises.id],
  }),
}));

// --- Abgeleitete Typen für die ganze App ------------------------------------

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;
export type TemplateExercise = typeof templateExercises.$inferSelect;
export type NewTemplateExercise = typeof templateExercises.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutSet = typeof sets.$inferSelect;
export type NewWorkoutSet = typeof sets.$inferInsert;
export type SetType = 'normal' | 'dropset' | 'restpause';
export type MuscleGroup = 'brust' | 'beine' | 'ruecken' | 'schultern' | 'arme' | 'core';
