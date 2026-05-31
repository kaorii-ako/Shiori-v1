# Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → New Query
3. Paste `schema.sql` content and run it
4. Go to Settings → API → copy URL and anon key
5. Add to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Enable Email + GitHub/Google OAuth in Authentication → Providers
7. Set redirect URL to `https://your-domain.com/auth/callback`
