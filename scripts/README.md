# Database Scripts

## Setup

Run `rebuild-schema.sql` in Supabase SQL Editor to create all tables.

## Migration

```bash
npm run migrate        # Automatic
npm run migrate:manual # Show SQL to run manually
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
