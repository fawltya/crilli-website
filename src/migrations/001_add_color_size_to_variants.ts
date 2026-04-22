import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-vercel-postgres'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "variants"
    ADD COLUMN IF NOT EXISTS "color" TEXT,
    ADD COLUMN IF NOT EXISTS "size" TEXT;
  `)

  await db.execute(sql`
    ALTER TABLE "_variants_v"
    ADD COLUMN IF NOT EXISTS "version_color" TEXT,
    ADD COLUMN IF NOT EXISTS "version_size" TEXT;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_variants_v"
    DROP COLUMN IF EXISTS "version_color",
    DROP COLUMN IF EXISTS "version_size";
  `)

  await db.execute(sql`
    ALTER TABLE "variants"
    DROP COLUMN IF EXISTS "color",
    DROP COLUMN IF EXISTS "size";
  `)
}

