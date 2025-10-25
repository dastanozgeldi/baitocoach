# BaitoCoach - Better Auth Setup Guide

This project uses Better Auth for authentication with email/password login, integrated with Drizzle ORM and PostgreSQL.

## Prerequisites

- Node.js 20+ and pnpm installed
- Docker and Docker Compose (for PostgreSQL)

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432 with:
- Username: `postgres`
- Password: `postgres`
- Database: `baito_coach`

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/baito_coach
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
```

> **Important:** Change `BETTER_AUTH_SECRET` to a secure random string in production!

### 4. Push Database Schema

```bash
pnpm db:push
```

This will create all necessary tables in your PostgreSQL database:
- `user` - Stores user accounts
- `session` - Manages user sessions
- `account` - Handles authentication providers
- `verification` - Email verification tokens

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the homepage.

- **Homepage** (`/`) - Protected route that shows user dashboard when authenticated, redirects to sign-in when not
- **Sign In Page** (`/sign-in`) - Dedicated authentication page with login/signup forms

## Features Implemented

✅ Email and password authentication  
✅ User registration (sign up)  
✅ User login (sign in)  
✅ Session management  
✅ Sign out functionality  
✅ Modern UI with shadcn components  
✅ Drizzle ORM integration  
✅ PostgreSQL database storage  

## Database Commands

- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema changes to database (quick sync)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
/app
  /api/auth/[...all]     # Better Auth API routes
  /sign-in
    page.tsx             # Dedicated sign-in page
  page.tsx               # Protected homepage (dashboard)
/components
  /ui                    # shadcn UI components
  auth-form.tsx          # Login/signup form component
/drizzle
  schema.ts              # Database schema
  index.ts               # Database connection
/lib
  auth.ts                # Better Auth server configuration
  auth-client.ts         # Better Auth client hooks
```

## Using Authentication in Your App

### Server Components

```typescript
import { auth } from '@/lib/auth';

export default async function ServerPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user.name}</div>;
}
```

### Client Components

```typescript
'use client';

import { useSession, signOut } from '@/lib/auth-client';

export function ClientComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return (
    <div>
      <p>Hello {session.user.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Troubleshooting

### Database Connection Issues

If you can't connect to the database:
1. Check that Docker is running: `docker ps`
2. Verify the database is healthy: `docker-compose ps`
3. Check the DATABASE_URL in your `.env` file

### Authentication Not Working

1. Make sure the database tables are created: `pnpm db:push`
2. Check that BETTER_AUTH_SECRET is set in `.env`
3. Verify NEXT_PUBLIC_APP_URL matches your development URL

### Port Already in Use

If port 5432 is already in use:
1. Stop other PostgreSQL instances
2. Or change the port in `docker-compose.yml` and update DATABASE_URL

## Next Steps

You can now extend this authentication system with:
- Email verification
- Password reset
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- User profile management
- Role-based access control

Refer to [Better Auth documentation](https://www.better-auth.com/docs) for more features.

