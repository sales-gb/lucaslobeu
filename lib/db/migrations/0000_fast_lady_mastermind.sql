CREATE TABLE `about_content` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`intro` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '[]' NOT NULL,
	`selected_clients` text DEFAULT '[]' NOT NULL,
	`recognition` text DEFAULT '[]' NOT NULL,
	`trajectory` text DEFAULT '[]' NOT NULL,
	`contact_blurb` text DEFAULT '' NOT NULL,
	`portrait_image_id` text,
	`numbers` text DEFAULT '[]' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `home_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`manifesto_text` text DEFAULT 'Cada projeto começa por um caderno. A maior parte dele acontece antes da câmera ser acionada. O resto é só obediência ao plano.' NOT NULL,
	`cta_headline` text DEFAULT 'Tem um projeto?' NOT NULL,
	`cta_sub` text DEFAULT 'O estúdio aceita três a quatro projetos por trimestre.' NOT NULL,
	`hero_variant` text DEFAULT 'editorial' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `home_tiles` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`kind` text DEFAULT 'photo' NOT NULL,
	`label` text NOT NULL,
	`image_id` text,
	`duration` text,
	`linked_project_slug` text,
	`ratio` text DEFAULT '4/5' NOT NULL,
	`tone` text DEFAULT 'mid' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`image_id` text,
	`read_time` text DEFAULT '3 min',
	`published_at` text DEFAULT (datetime('now')) NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_slug_unique` ON `journal` (`slug`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	`kind` text DEFAULT 'primary' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`path` text NOT NULL,
	`alt` text DEFAULT '',
	`project_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`client` text NOT NULL,
	`year` text NOT NULL,
	`category` text NOT NULL,
	`role` text NOT NULL,
	`summary` text NOT NULL,
	`body` text DEFAULT '[]' NOT NULL,
	`credits` text DEFAULT '[]' NOT NULL,
	`cover_image_id` text,
	`cover_tone` text DEFAULT 'mid' NOT NULL,
	`cover_kind` text DEFAULT 'tall' NOT NULL,
	`template` text DEFAULT 'editorial' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text DEFAULT 'Lucas Lobeu' NOT NULL,
	`city` text DEFAULT 'São Paulo, BR' NOT NULL,
	`bio` text DEFAULT 'Diretor, fotógrafo e diretor de social. SP, 2019—.' NOT NULL,
	`phone` text DEFAULT '+55 11 9 8472-0418',
	`instagram` text DEFAULT '@lucaslobeu',
	`vimeo` text DEFAULT 'vimeo.com/lucaslobeu',
	`behance` text DEFAULT 'behance.net/lucaslobeu',
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);