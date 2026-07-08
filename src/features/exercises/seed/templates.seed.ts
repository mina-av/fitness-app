export interface TemplateSeedExercise {
  exerciseName: string;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface TemplateSeedData {
  name: string;
  note?: string;
  exercises: TemplateSeedExercise[];
}

// Referenziert Übungen aus exercises.seed.ts über den Namen (wird beim Seeden aufgelöst).
export const templateSeedData: TemplateSeedData[] = [
  {
    name: 'Push',
    note: 'Brust, Schultern, Trizeps',
    exercises: [
      { exerciseName: 'Bankdrücken', targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
      { exerciseName: 'Schrägbankdrücken', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { exerciseName: 'Schulterdrücken', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { exerciseName: 'Seitheben', targetSets: 3, targetRepsMin: 12, targetRepsMax: 15 },
      {
        exerciseName: 'Trizepsdrücken am Kabel',
        targetSets: 3,
        targetRepsMin: 10,
        targetRepsMax: 15,
      },
    ],
  },
  {
    name: 'Full Body',
    note: 'Ganzkörper-Grundübungen',
    exercises: [
      { exerciseName: 'Kniebeuge', targetSets: 4, targetRepsMin: 6, targetRepsMax: 10 },
      { exerciseName: 'Bankdrücken', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { exerciseName: 'Rudern vorgebeugt', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { exerciseName: 'Schulterdrücken', targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
      { exerciseName: 'Plank', targetSets: 3, targetRepsMin: 30, targetRepsMax: 60 },
    ],
  },
];
