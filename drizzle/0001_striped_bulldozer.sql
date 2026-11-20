ALTER TABLE "glosario" ADD COLUMN "patron_flags" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "imagenes" ADD COLUMN "miniatura_url" text;--> statement-breakpoint
ALTER TABLE "imagenes" ADD COLUMN "miniatura_key" text;--> statement-breakpoint
ALTER TABLE "municion" ADD COLUMN "patron_flags" text DEFAULT '' NOT NULL;