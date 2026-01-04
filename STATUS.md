# Project Status

## Dev Features (config/dev-config.ts)

```typescript
DEV_AUTH_BYPASS = false      // Skip login, use mock user
DEV_SHOW_CONTROLS = true     // Show stat adjustment panel
DEV_SHOW_MOVEMENT_TEST = true // Show movement test button
```

All features require `__DEV__` mode (auto-disabled in production).

## Row Level Security - DISABLED

All tables have RLS disabled for testing.

## Production Checklist

1. Set all `DEV_*` flags to `false` in `config/dev-config.ts`
2. Enable RLS:
   ```sql
   ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
   ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
   ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;
   ```
3. Update `.env` with production Supabase credentials
4. Test auth flow end-to-end
