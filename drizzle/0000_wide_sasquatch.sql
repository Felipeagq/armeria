CREATE TABLE "accesorios" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"grupo" text NOT NULL,
	"resumen" text DEFAULT '' NOT NULL,
	"tecnico" text[] DEFAULT '{}'::text[] NOT NULL,
	"modelos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"claves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"datos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"como" text[] DEFAULT '{}'::text[] NOT NULL,
	"tipos" jsonb,
	"pros" text[] DEFAULT '{}'::text[] NOT NULL,
	"contras" text[] DEFAULT '{}'::text[] NOT NULL,
	"airsoft" text DEFAULT '' NOT NULL,
	"piezas_3d" text[] DEFAULT '{}'::text[] NOT NULL,
	"fuente" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "armas" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"fabricante" text DEFAULT '' NOT NULL,
	"grupo" text NOT NULL,
	"pais" text,
	"specs_comunes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calibres" text[] DEFAULT '{}'::text[] NOT NULL,
	"origen" text DEFAULT 'catalogo' NOT NULL,
	"revisado" boolean DEFAULT true NOT NULL,
	"fuente" jsonb,
	"generico" text,
	"tipo" text,
	"resumen" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone,
	CONSTRAINT "armas_origen_ck" CHECK ("armas"."origen" in ('catalogo','wikipedia','ia'))
);
--> statement-breakpoint
CREATE TABLE "glosario" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"grupo" text NOT NULL,
	"corto" text NOT NULL,
	"detalle" text DEFAULT '' NOT NULL,
	"patron" text NOT NULL,
	"sigla" text,
	"apodo" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "imagenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"entidad_tipo" text NOT NULL,
	"entidad_id" text NOT NULL,
	"url" text NOT NULL,
	"origen" text NOT NULL,
	"s3_key" text,
	"rol" text DEFAULT 'galeria' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"titulo" text,
	"autor" text,
	"licencia" text,
	"licencia_url" text,
	"fuente_url" text,
	"ajuste" text,
	"tipo_foto" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone,
	CONSTRAINT "imagenes_entidad_ck" CHECK ("imagenes"."entidad_tipo" in ('arma','municion','accesorio')),
	CONSTRAINT "imagenes_origen_ck" CHECK ("imagenes"."origen" in ('s3','externo')),
	CONSTRAINT "imagenes_rol_ck" CHECK ("imagenes"."rol" in ('principal','galeria'))
);
--> statement-breakpoint
CREATE TABLE "municion" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"nombre_corto" text NOT NULL,
	"tipo" text DEFAULT 'real' NOT NULL,
	"eslogan" text DEFAULT '' NOT NULL,
	"patron_calibre" text,
	"claves" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hechos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sobre" text[] DEFAULT '{}'::text[] NOT NULL,
	"fuente" text DEFAULT '' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone,
	CONSTRAINT "municion_tipo_ck" CHECK ("municion"."tipo" in ('real','airsoft'))
);
--> statement-breakpoint
CREATE TABLE "registro_cambios" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"usuario" text NOT NULL,
	"accion" text NOT NULL,
	"entidad_tipo" text NOT NULL,
	"entidad_id" text NOT NULL,
	"antes" jsonb,
	"despues" jsonb
);
--> statement-breakpoint
CREATE TABLE "variante_accesorio" (
	"variante_id" integer NOT NULL,
	"accesorio_id" text NOT NULL,
	CONSTRAINT "variante_accesorio_variante_id_accesorio_id_pk" PRIMARY KEY("variante_id","accesorio_id")
);
--> statement-breakpoint
CREATE TABLE "variante_municion" (
	"variante_id" integer NOT NULL,
	"municion_id" text NOT NULL,
	CONSTRAINT "variante_municion_variante_id_municion_id_pk" PRIMARY KEY("variante_id","municion_id")
);
--> statement-breakpoint
CREATE TABLE "variantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"arma_id" text NOT NULL,
	"slug" text NOT NULL,
	"nombre" text NOT NULL,
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"plataforma_3d" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"archivado_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "variante_accesorio" ADD CONSTRAINT "variante_accesorio_variante_id_variantes_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variante_accesorio" ADD CONSTRAINT "variante_accesorio_accesorio_id_accesorios_id_fk" FOREIGN KEY ("accesorio_id") REFERENCES "public"."accesorios"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "variante_municion" ADD CONSTRAINT "variante_municion_variante_id_variantes_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variante_municion" ADD CONSTRAINT "variante_municion_municion_id_municion_id_fk" FOREIGN KEY ("municion_id") REFERENCES "public"."municion"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_arma_id_armas_id_fk" FOREIGN KEY ("arma_id") REFERENCES "public"."armas"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "accesorios_grupo_idx" ON "accesorios" USING btree ("grupo");--> statement-breakpoint
CREATE INDEX "armas_grupo_idx" ON "armas" USING btree ("grupo");--> statement-breakpoint
CREATE INDEX "imagenes_entidad_idx" ON "imagenes" USING btree ("entidad_tipo","entidad_id");--> statement-breakpoint
CREATE UNIQUE INDEX "imagenes_entidad_url_uq" ON "imagenes" USING btree ("entidad_tipo","entidad_id","url");--> statement-breakpoint
CREATE UNIQUE INDEX "imagenes_principal_uq" ON "imagenes" USING btree ("entidad_tipo","entidad_id") WHERE "imagenes"."rol" = 'principal' and "imagenes"."archivado_en" is null;--> statement-breakpoint
CREATE INDEX "registro_entidad_idx" ON "registro_cambios" USING btree ("entidad_tipo","entidad_id");--> statement-breakpoint
CREATE INDEX "registro_fecha_idx" ON "registro_cambios" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "variante_accesorio_acc_idx" ON "variante_accesorio" USING btree ("accesorio_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variantes_arma_slug_uq" ON "variantes" USING btree ("arma_id","slug");