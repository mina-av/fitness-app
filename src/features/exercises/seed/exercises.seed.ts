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

  // --- Brust: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Diamant-Liegestütze',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps'],
    equipment: 'koerpergewicht',
    description: 'Enge Handposition, betont Trizeps und inneren Brustmuskel.',
  },
  {
    name: 'Liegestütze mit erhöhten Füßen',
    muscleGroup: 'brust',
    secondaryMuscles: ['schultern', 'trizeps'],
    equipment: 'koerpergewicht',
    description: 'Füße erhöht (z.B. auf einer Bank) für mehr Fokus auf den oberen Brustmuskel.',
  },
  {
    name: 'Archer-Liegestütze',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps', 'core'],
    equipment: 'koerpergewicht',
    description: 'Einseitig betonte Liegestütz-Variante für mehr Intensität ohne Zusatzgewicht.',
  },
  {
    name: 'Brustdrücken mit Widerstandsband',
    muscleGroup: 'brust',
    secondaryMuscles: ['trizeps', 'schultern'],
    equipment: 'widerstandsband',
    description:
      'Band hinter dem Rücken fixieren, nach vorne drücken — gute Reise-/Zuhause-Alternative.',
  },
  {
    name: 'Fliegende mit Widerstandsband',
    muscleGroup: 'brust',
    equipment: 'widerstandsband',
    description: 'Isolationsübung für die Brust ohne Geräte, konstante Bandspannung.',
  },
  {
    name: 'Pike-Liegestütz',
    muscleGroup: 'brust',
    secondaryMuscles: ['schultern', 'trizeps'],
    equipment: 'koerpergewicht',
    description: 'Hüfte hoch, Oberkörper nach unten — Übergangsübung Richtung Schulterdrücken.',
  },

  // --- Beine: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Goblet Squat',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'kurzhantel',
    description: 'Kniebeuge mit einer Kurzhantel vor der Brust — einsteigerfreundlich.',
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'kurzhantel',
    description: 'Hinterer Fuß erhöht, einbeinige Kniebeuge — hart, aber sehr effektiv.',
  },
  {
    name: 'Wandsitz',
    muscleGroup: 'beine',
    equipment: 'koerpergewicht',
    description: 'Statisches Halten mit dem Rücken an der Wand, Oberschenkel parallel zum Boden.',
  },
  {
    name: 'Kettlebell Swing',
    muscleGroup: 'beine',
    secondaryMuscles: ['ruecken', 'core'],
    equipment: 'kettlebell',
    description: 'Explosive Hüftstreckung — Ganzkörperübung mit Fokus auf hintere Kette.',
  },
  {
    name: 'Step-ups',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'koerpergewicht',
    description: 'Auf eine Erhöhung (Bank, Stufe) steigen — einbeinige Kraft und Stabilität.',
  },
  {
    name: 'Kniebeuge mit Widerstandsband',
    muscleGroup: 'beine',
    equipment: 'widerstandsband',
    description: 'Band unter den Füßen oder um die Knie für zusätzlichen Widerstand.',
  },
  {
    name: 'Airborne Lunges',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'koerpergewicht',
    description: 'Ausfallschritte ohne Zusatzgewicht, kontrollierte Ausführung.',
  },
  {
    name: 'Hip Thrust',
    muscleGroup: 'beine',
    secondaryMuscles: ['ruecken', 'core'],
    equipment: 'langhantel',
    description: 'Schultern auf einer Bank, Langhantel über der Hüfte — Kernübung für das Gesäß.',
  },
  {
    name: 'Glute Bridge',
    muscleGroup: 'beine',
    secondaryMuscles: ['core'],
    equipment: 'koerpergewicht',
    description: 'Zuhause-Variante des Hip Thrust ohne Gewicht, Rücken flach am Boden.',
  },
  {
    name: 'Hip Thrust mit Kurzhantel',
    muscleGroup: 'beine',
    secondaryMuscles: ['ruecken', 'core'],
    equipment: 'kurzhantel',
    description: 'Hip Thrust mit einer Kurzhantel über der Hüfte statt der Langhantel.',
  },

  // --- Rücken: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Rudern mit Widerstandsband',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'widerstandsband',
    description: 'Band um die Füße oder an einem festen Punkt fixieren, zum Körper ziehen.',
  },
  {
    name: 'Superman',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['core'],
    equipment: 'koerpergewicht',
    description: 'Bauchlage, Arme und Beine gleichzeitig heben — für den unteren Rücken.',
  },
  {
    name: 'Einarmiges Kurzhantelrudern',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'kurzhantel',
    description: 'Abgestützt auf einer Bank, eine Seite isoliert trainieren.',
  },
  {
    name: 'Kreuzheben mit Kurzhanteln',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['beine', 'core'],
    equipment: 'kurzhantel',
    description: 'Zuhause-Alternative zum klassischen Kreuzheben mit der Langhantel.',
  },
  {
    name: 'Kettlebell-Rudern vorgebeugt',
    muscleGroup: 'ruecken',
    secondaryMuscles: ['arme'],
    equipment: 'kettlebell',
    description: 'Vorgebeugte Position, Kettlebell zum Bauch ziehen.',
  },

  // --- Schultern: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Schulterdrücken mit Widerstandsband',
    muscleGroup: 'schultern',
    secondaryMuscles: ['trizeps'],
    equipment: 'widerstandsband',
    description: 'Band unter den Füßen fixieren, nach oben drücken.',
  },
  {
    name: 'Seitheben mit Widerstandsband',
    muscleGroup: 'schultern',
    equipment: 'widerstandsband',
    description: 'Isolationsübung für die seitliche Schulter ohne Gewichte.',
  },
  {
    name: 'Kettlebell Press',
    muscleGroup: 'schultern',
    secondaryMuscles: ['trizeps', 'core'],
    equipment: 'kettlebell',
    description: 'Einarmiges Überkopfdrücken, fordert zusätzlich die Rumpfstabilität.',
  },
  {
    name: 'Pike Push-ups',
    muscleGroup: 'schultern',
    secondaryMuscles: ['trizeps'],
    equipment: 'koerpergewicht',
    description:
      'Liegestütz-Variante mit hoher Hüfte — Körpergewichts-Alternative zum Schulterdrücken.',
  },

  // --- Arme: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Trizeps-Dips am Stuhl',
    muscleGroup: 'arme',
    equipment: 'koerpergewicht',
    description: 'Hände auf einer Stuhl-/Bankkante abstützen, Körper absenken und drücken.',
  },
  {
    name: 'Bizepscurls mit Widerstandsband',
    muscleGroup: 'arme',
    equipment: 'widerstandsband',
    description: 'Band unter die Füße stellen, klassische Curl-Bewegung.',
  },
  {
    name: 'Trizeps-Kickback mit Widerstandsband',
    muscleGroup: 'arme',
    equipment: 'widerstandsband',
    description: 'Vorgebeugte Position, Band nach hinten strecken.',
  },
  {
    name: 'Kettlebell-Curls',
    muscleGroup: 'arme',
    equipment: 'kettlebell',
    description: 'Bizeps-Übung mit dem dickeren Kettlebell-Griff für mehr Unterarm-Beteiligung.',
  },

  // --- Core: zusätzlich, v.a. Zuhause-tauglich ---
  {
    name: 'Mountain Climbers',
    muscleGroup: 'core',
    secondaryMuscles: ['beine'],
    equipment: 'koerpergewicht',
    description: 'Dynamische Übung im Liegestütz, Knie abwechselnd zur Brust ziehen.',
  },
  {
    name: 'Bicycle Crunches',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Diagonale Bewegung für gerade und schräge Bauchmuskeln.',
  },
  {
    name: 'Side Plank',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Seitliche Unterarmstütz-Position, trainiert die schrägen Bauchmuskeln.',
  },
  {
    name: 'Hollow Body Hold',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Statisches Halten in Bootsform — Ganzkörperspannung für den Rumpf.',
  },
  {
    name: 'Beinheben liegend',
    muscleGroup: 'core',
    equipment: 'koerpergewicht',
    description: 'Rückenlage, gestreckte Beine heben und senken — Fokus unterer Bauch.',
  },
  {
    name: 'Pallof Press',
    muscleGroup: 'core',
    equipment: 'widerstandsband',
    description: 'Anti-Rotations-Übung, Band seitlich fixieren und geradeaus drücken.',
  },
];
