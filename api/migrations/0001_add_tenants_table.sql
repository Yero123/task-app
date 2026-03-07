CREATE TABLE IF NOT EXISTS "tenants" (
	"id" text PRIMARY KEY NOT NULL
);

INSERT INTO "tenants" ("id") VALUES ('tenant_a'), ('tenant_b')
ON CONFLICT ("id") DO NOTHING;

DO $$ BEGIN
  ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_tenants_id_fk"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
