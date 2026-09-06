# Generated migrations

Drizzle Kit generates migrations here from `src/db/schema.ts`, which exports the small domain schema modules. `0000_foundation.sql` creates twenty application tables without seeding any rows. `migrations.js` and `meta/` are generated migration artifacts and belong in Git.

Run `npm run db:generate -- --name descriptive_change` after changing the typed schema; review the SQL and run `npm test`. Do not hand-edit generated SQL or rewrite a migration already deployed to a device. The first unpublished migration was regenerated during foundation review before any device use.

SQL is bundled through Babel's inline-import plugin and Metro's SQL extension. `src/db/initialize.ts` applies migrations using Drizzle's Expo migrator inside the provider's initialization callback. It enables foreign keys and WAL, then checks foreign-key integrity. Failures stop the shell; startup never resets a database to recover.

Runtime SQLite files, personal recordings and test databases do not belong here. Desktop SQLite integration tests exercise the generated migration and initializer; Android native-bridge validation remains a physical-device check.
