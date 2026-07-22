# Workshop Order Tracker

## Environment

The frontend must use the public Supabase anon key.

Create a `.env.local` file with:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not expose the Supabase service role or secret key in the browser.

## GitHub Actions secrets

For the Pages deployment workflow, add these repository secrets:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use the anon key only. Do not put the Supabase service role or secret key into a frontend build workflow.

## Authentication

The app now requires Supabase Auth before the main UI is visible. Users can sign in or create an account with email and password.

## Database security

Apply the latest migration so `orders` and `order_items` are protected by Row Level Security and linked to the authenticated user.
