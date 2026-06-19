ALTER TABLE `home_settings` ADD COLUMN `hero_roles` text DEFAULT 'Filmmaker · Photographer · Social' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `hero_description` text DEFAULT 'Diretor audiovisual e fotógrafo. Narrativas visuais que movem marcas, produtos e pessoas.' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `about_statement` text DEFAULT 'DIRETOR AUDIOVISUAL E FOTÓGRAFO DE SÃO PAULO. CRIO IMAGENS CLARAS, IMPACTANTES E AUTÊNTICAS PARA MARCAS E FUNDADORES — TRABALHOS QUE PARECEM CERTOS, FUNCIONAM BEM E DURAM.' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `about_footer_headline` text DEFAULT 'O TRABALHO NÃO É SÓ BONITO — ELE PERFORMA. ISSO É O QUE ESTÁ POR TRÁS DE CADA IMAGEM.' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `stats` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `testimonials` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `faq_items` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `home_settings` ADD COLUMN `clients` text DEFAULT '[]' NOT NULL;
