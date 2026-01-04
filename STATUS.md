# Project Status

## Currently Disabled (Dev Mode)

### Authentication - BYPASSED
```typescript
// context/supabase-provider.tsx:18
const TESTING_MODE = true;  // Set to false for real auth
```

### Row Level Security - DISABLED
All tables have RLS disabled for testing.

## Production Checklist

1. Set `TESTING_MODE = false` in `context/supabase-provider.tsx`
2. Enable RLS:
   ```sql
   ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
   ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
   ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;
   ```
3. Update `.env` with production Supabase credentials
4. Test auth flow end-to-end
