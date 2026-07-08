CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`name` text NOT NULL,
	`muscle_group` text NOT NULL,
	`secondary_muscles` text,
	`equipment` text,
	`description` text,
	`media_url` text,
	`is_custom` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_exercises_muscle_group` ON `exercises` (`muscle_group`);--> statement-breakpoint
CREATE TABLE `sets` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`workout_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight_kg` real NOT NULL,
	`rir` integer,
	`rpe` real,
	`set_type` text DEFAULT 'normal' NOT NULL,
	`superset_group` text,
	`note` text,
	`is_warmup` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sets_workout` ON `sets` (`workout_id`);--> statement-breakpoint
CREATE INDEX `idx_sets_exercise` ON `sets` (`exercise_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `template_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`template_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`position` integer NOT NULL,
	`target_sets` integer,
	`target_reps_min` integer,
	`target_reps_max` integer,
	FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_template_exercises_template` ON `template_exercises` (`template_id`,`position`);--> statement-breakpoint
CREATE TABLE `workout_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`name` text NOT NULL,
	`note` text,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`date` integer NOT NULL,
	`template_id` text,
	`note` text,
	`finished_at` integer,
	FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_workouts_date` ON `workouts` (`date`);