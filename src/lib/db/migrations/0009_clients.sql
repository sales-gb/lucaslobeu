CREATE TABLE `clients` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`year` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`instagram_url` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `client_id` text;
