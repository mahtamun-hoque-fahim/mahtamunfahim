// Run with: npx tsx scripts/export-backup.ts
// Dumps all app table data to JSON for safekeeping before migrations.
// Requires DATABASE_URL in env.

import { neon } from '@neondatabase/serverless'
import { writeFileSync } from 'fs'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

  // Every app table (auth tables excluded). Tables already dropped by a later
  // migration are skipped, so the script keeps working after the drops.
  const tables = [
    'blog_posts', 'contact_messages', 'projects', 'testimonials', 'footer_links',
    'site_settings', 'about_content', 'skills', 'credential_timeline',
    'credential_clusters', 'credential_certs', 'credential_community', 'credential_contributions',
  ]

  for (const table of tables) {
    // @neondatabase/serverless v1: use sql.query() for non-tagged calls.
    // Table names cannot be parameterized; this list is hardcoded so safe.
    let rows: Record<string, unknown>[]
    try {
      rows = await sql.query(`SELECT * FROM ${table}`)
    } catch {
      console.log(`Skipped ${table} (not in this database)`)
      continue
    }
    const filename = `backup_${table}_${timestamp}.json`
    writeFileSync(filename, JSON.stringify(rows, null, 2))
    console.log(`Exported ${rows.length} rows -> ${filename}`)
  }
}

main().catch(console.error)
