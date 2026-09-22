CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text,
	`health_entry_id` text,
	`diary_entry_id` text,
	`document_id` text,
	`path` text NOT NULL,
	`sha256` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`health_entry_id`) REFERENCES `health_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`diary_entry_id`) REFERENCES `diary_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "attachments_one_parent" CHECK(("attachments"."dog_id" IS NOT NULL) + ("attachments"."health_entry_id" IS NOT NULL) + ("attachments"."diary_entry_id" IS NOT NULL) + ("attachments"."document_id" IS NOT NULL) = 1)
);
--> statement-breakpoint
CREATE TABLE `diary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`date` text NOT NULL,
	`minute` integer NOT NULL,
	`category` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "diary_entries_minute" CHECK("diary_entries"."minute" BETWEEN 0 AND 1439),
	CONSTRAINT "diary_entries_category" CHECK("diary_entries"."category" IN ('appetite', 'digestion', 'skin_coat', 'activity', 'behavior', 'other'))
);
--> statement-breakpoint
CREATE INDEX `diary_entries_dog` ON `diary_entries` (`dog_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "documents_category" CHECK("documents"."category" IN ('pet_passport', 'insurance', 'amicus', 'pedigree', 'invoice', 'other'))
);
--> statement-breakpoint
CREATE INDEX `documents_dog` ON `documents` (`dog_id`);--> statement-breakpoint
CREATE TABLE `dogs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`birth_date` text,
	`birth_year` integer,
	`breed` text,
	`sex` text,
	`neutered` integer DEFAULT false NOT NULL,
	`color_markings` text,
	`chip_number` text,
	`amicus_registered` integer DEFAULT false NOT NULL,
	`insurance_name` text,
	`insurance_policy` text,
	`insurance_phone` text,
	`vet_name` text,
	`vet_phone` text,
	`vet_address` text,
	`food` text,
	`allergies` text,
	`care_notes` text,
	`archived_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "dogs_sex" CHECK("dogs"."sex" IS NULL OR "dogs"."sex" IN ('male', 'female')),
	CONSTRAINT "dogs_chip_number" CHECK("dogs"."chip_number" IS NULL OR (length("dogs"."chip_number") = 15 AND "dogs"."chip_number" NOT GLOB '*[^0-9]*'))
);
--> statement-breakpoint
CREATE TABLE `dose_log` (
	`id` text PRIMARY KEY NOT NULL,
	`medication_id` text NOT NULL,
	`scheduled_at` text NOT NULL,
	`given_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dose_log_once` ON `dose_log` (`medication_id`,`scheduled_at`);--> statement-breakpoint
CREATE TABLE `health_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`kind` text NOT NULL,
	`date` text NOT NULL,
	`product` text,
	`note` text,
	`next_due_date` text,
	`repeat_months` integer,
	`completed_by_entry_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`completed_by_entry_id`) REFERENCES `health_entries`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "health_entries_kind" CHECK("health_entries"."kind" IN ('vaccination', 'deworming', 'parasite_protection', 'vet_visit')),
	CONSTRAINT "health_entries_repeat" CHECK("health_entries"."repeat_months" IS NULL OR "health_entries"."repeat_months" > 0)
);
--> statement-breakpoint
CREATE INDEX `health_entries_dog` ON `health_entries` (`dog_id`);--> statement-breakpoint
CREATE TABLE `medications` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`name` text NOT NULL,
	`dose` text NOT NULL,
	`times` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `medications_dog` ON `medications` (`dog_id`);--> statement-breakpoint
CREATE TABLE `owner` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "owner_single_row" CHECK("owner"."id" = '00000000-0000-4000-8000-000000000001')
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text,
	`title` text NOT NULL,
	`first_due_date` text NOT NULL,
	`repeat` text NOT NULL,
	`repeat_months` integer,
	`lead_days` integer NOT NULL,
	`done_until` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reminders_repeat" CHECK("reminders"."repeat" IN ('none', 'monthly', 'every_n_months', 'yearly')),
	CONSTRAINT "reminders_repeat_months" CHECK(("reminders"."repeat" = 'every_n_months') = ("reminders"."repeat_months" IS NOT NULL AND "reminders"."repeat_months" > 0)),
	CONSTRAINT "reminders_lead_days" CHECK("reminders"."lead_days" BETWEEN 0 AND 365)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`reminder_minute` integer NOT NULL,
	`default_lead_days` integer NOT NULL,
	`demo_loaded` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "settings_single_row" CHECK("settings"."id" = '00000000-0000-4000-8000-000000000001'),
	CONSTRAINT "settings_reminder_minute" CHECK("settings"."reminder_minute" BETWEEN 0 AND 1439),
	CONSTRAINT "settings_default_lead_days" CHECK("settings"."default_lead_days" BETWEEN 0 AND 365)
);
--> statement-breakpoint
CREATE TABLE `weights` (
	`id` text PRIMARY KEY NOT NULL,
	`dog_id` text NOT NULL,
	`date` text NOT NULL,
	`grams` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`dog_id`) REFERENCES `dogs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "weights_grams" CHECK("weights"."grams" > 0 AND "weights"."grams" < 200000)
);
--> statement-breakpoint
CREATE INDEX `weights_dog` ON `weights` (`dog_id`);