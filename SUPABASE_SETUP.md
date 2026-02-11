# Supabase Configuration

## Setup Instructions

### 1. Get your Supabase Anon Key

1. Go to your Supabase project dashboard: https://app.supabase.com/project/kizsruvrwfbqtajbndop
2. Click on "Settings" (gear icon in sidebar)
3. Click on "API"
4. Copy the "anon public" key (NOT the service_role key!)

### 2. Update the database service

Open `src/app/services/database.service.ts` and replace:

```typescript
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual anon key.

### 3. Create database tables

1. Go to Supabase SQL Editor: https://app.supabase.com/project/kizsruvrwfbqtajbndop/sql
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL

### 4. Test the connection

Run the application:

```bash
npm run start
```

Check the browser console for "✅ Połączono z Supabase" message.

## Database Structure

- **app_state**: Stores current step and last saved timestamp per user
- **step_mapping**: Maps step numbers to packages (JSONB array)
- **selected_packages**: Currently selected packages for the active step

## Security Notes

- All tables use Row Level Security (RLS)
- Currently set to allow all operations (public access)
- For production, implement proper authentication and update RLS policies
