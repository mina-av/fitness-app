import type { MuscleGroup } from '@/db/schema';

export interface ExerciseSeedData {
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: string;
  description: string;
}

// ~40 Standardübungen über alle 6 Kategorien. isCustom=false, wird beim Seed
// gesetzt (nicht hier, da das Feld nicht Teil der reinen Seed-Daten ist).
export const exerciseSeedData: ExerciseSeedData[] = [
  // --- Brust (7) ---
  {
    name: 'Bankdrücken',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps', 'schultern'],
    equipment: 'langhantel',
    description: 'Grundübung für die Brustmuskulatur, flach auf der Bank.',
  },
  {
    name: 'Schrägbankdrücken',
    muscleGroup: 'brust',
    secondaryMuscles: ['schultern', 'trizeps'],
    equipment: 'langhantel',
    description: 'Betont den oberen Brustmuskel durch die Schrägbank.',
  },
  {
    name: 'Kurzhantel-Fliegende',
    muscleGroup: 'brust',
    equipment: 'kurzhantel',
    description: 'Isolationsübung für die Brust, große Dehnung in der Endposition.',
  },
  {
    name: 'Dips',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps'],
    equipment: 'koerpergewicht',
    description: 'Barrenstütz, Oberkörper vorgeneigt für Brustfokus.',
  },
  {
    name: 'Liegestütze',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps', 'core'],
    equipment: 'koerpergewicht',
    description: 'Klassische Körpergewichtsübung für Brust, Trizeps und Rumpf.',
  },
  {
    name: 'Cable Crossover',
    muscleGroup: 'brust',
    equipment: 'kabelzug',
    description: 'Isolationsübung am Kabelzug mit konstanter Spannung.',
  },
  {
    name: 'Butterfly-Maschine',
    muscleGroup: 'brust',
    equipment: 'maschine',
    description: 'Geführte Isolationsübung, gut für Einsteiger.',
  },

  // --- Beine (7) ---
  {
    name: 'Kniebeuge',
    muscleGroup: 'beine',
    secondaryMuscles: ['core', 'ruecken'],
    equipment: 'langhantel',
    description: 'Grundübung für die gesamte Beinmuskulatur.',
  },
  {
    name: 'Beinpresse',
    muscleGroup: 'beine',
    equipment: 'maschine',
    description: 'Geführte Alternative zur Kniebeuge, hohe Belastbarkeit.',
  },
  {
    name: 'Ausfallschritte',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'kurzhantel',
    description: 'Einbeinige Übung für Kraft und Stabilität.',
  },
  {
    name: 'Rumänisches Kreuzheben',
    muscleGroup: 'beine',
    secondaryMuscles: ['ruecken'],
    equipment: 'langhantel',
    description: 'Fokus auf Beinbeuger und Gesäß, gestreckte Beine.',
  },
  {
    name: 'Beinstrecker',
    muscleGroup: 'beine',
    equipment: 'maschine',
    description: 'Isolationsübung für den vorderen Oberschenkel.',
  },
  {
    name: 'Beinbeuger',
    muscleGroup: 'beine',
    equipment: 'maschine',
    description: 'Isolationsübung für die hintere Oberschenkelmuskulatur.',
  },
  {
    name: 'Wadenheben',
    muscleGroup: 'beine',
    equipment: 'maschine',
    description: 'Isolationsübung für die Wadenmuskulatur.',
  },

  // --- Rücken (7) ---
  {
    name: 'Klimmzüge',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'koerpergewicht',
    description: 'Grundübung für den breiten Rücken und Bizeps.',
  },
  {
    name: 'Latzug',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'kabelzug',
    description: 'Geführte Alternative zu Klimmzügen.',
  },
  {
    name: 'Rudern vorgebeugt',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme', 'schultern'],
    equipment: 'langhantel',
    description: 'Grundübung für den mittleren Rücken.',
  },
  {
    name: 'Kabelrudern sitzend',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'kabelzug',
    description: 'Rückenübung mit konstanter Zugspannung.',
  },
  {
    name: 'T-Bar-Rudern',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'langhantel',
    description: 'Rückenübung mit dickerem Muskelaufbau-Fokus.',
  },
  {
    name: 'Kreuzheben',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['beine', 'core'],
    equipment: 'langhantel',
    description: 'Ganzkörper-Grundübung mit Fokus auf die hintere Kette.',
  },
  {
    name: 'Hyperextensions',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['beine'],
    equipment: 'koerpergewicht',
    description: 'Isolationsübung für den unteren Rücken.',
  },

  // --- Schultern (6) ---
  {
    name: 'Schulterdrücken',
    muscleGroup: 'schultern',
    secondaryMuscles: ['trizeps'],
    equipment: 'langhantel',
    description: 'Grundübung für die gesamte Schultermuskulatur.',
  },
  {
    name: 'Seitheben',
    muscleGroup: 'schultern',
    equipment: 'kurzhantel',
    description: 'Isolationsübung für die seitliche Schulter.',
  },
  {
    name: 'Frontheben',
    muscleGroup: 'schultern',
    equipment: 'kurzhantel',
    description: 'Isolationsübung für die vordere Schulter.',
  },
  {
    name: 'Reverse Butterfly',
    muscleGroup: 'schultern',
    secondaryMuscles: ['ruecken'],
    equipment: 'maschine',
    description: 'Isolationsübung für die hintere Schulter.',
  },
  {
    name: 'Face Pulls',
    muscleGroup: 'schultern',
    secondaryMuscles: ['ruecken'],
    equipment: 'kabelzug',
    description: 'Gut für Schulterhaltung und hintere Schulter.',
  },
  {
    name: 'Arnold Press',
    muscleGroup: 'schultern',
    secondaryMuscles: ['trizeps'],
    equipment: 'kurzhantel',
    description: 'Rotierende Variante des Schulterdrückens.',
  },

  // --- Arme (7) ---
  {
    name: 'Bizepscurls Langhantel',
    muscleGroup: 'arme',
    equipment: 'langhantel',
    description: 'Grundübung für den Bizeps.',
  },
  {
    name: 'Hammercurls',
    muscleGroup: 'arme',
    equipment: 'kurzhantel',
    description: 'Curl-Variante mit neutralem Griff, betont den Unterarm.',
  },
  {
    name: 'Konzentrationscurls',
    muscleGroup: 'arme',
    equipment: 'kurzhantel',
    description: 'Isolationsübung mit Fokus auf den Bizeps-Peak.',
  },
  {
    name: 'Trizepsdrücken am Kabel',
    muscleGroup: 'arme',
    equipment: 'kabelzug',
    description: 'Isolationsübung für den Trizeps.',
  },
  {
    name: 'French Press',
    muscleGroup: 'arme',
    equipment: 'langhantel',
    description: 'Trizepsübung mit großer Dehnung.',
  },
  {
    name: 'Enges Bankdrücken',
    muscleGroup: 'arme',
    secondaryMuscles: ['brust'],
    equipment: 'langhantel',
    description: 'Verbundübung mit Trizepsfokus durch engen Griff.',
  },
  {
    name: 'Kickbacks',
    muscleGroup: 'arme',
    equipment: 'kurzhantel',
    description: 'Isolationsübung für den Trizeps, vorgebeugte Position.',
  },

  // --- Core (6) ---
  {
    name: 'Plank',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Statische Übung für die gesamte Rumpfstabilität.',
  },
  {
    name: 'Crunches',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Klassische Übung für die gerade Bauchmuskulatur.',
  },
  {
    name: 'Beinheben hängend',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Fokus auf den unteren Bauch, an der Stange hängend.',
  },
  {
    name: 'Russian Twists',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Rotationsübung für die schrägen Bauchmuskeln.',
  },
  {
    name: 'Ab Wheel Rollout',
    muscleGroup: 'core',
    secondaryMuscles: ['schultern'],
    equipment: 'sonstiges',
    description: 'Anspruchsvolle Übung für die gesamte Rumpfstabilität.',
  },
  {
    name: 'Cable Woodchop',
    muscleGroup: 'core',
    equipment: 'kabelzug',
    description: 'Rotationsübung am Kabelzug für die schrägen Bauchmuskeln.',
  },
];
