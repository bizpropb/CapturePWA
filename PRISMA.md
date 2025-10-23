# Prisma in This Project

## What is Prisma?

Prisma is a modern ORM (Object-Relational Mapping) tool that provides type-safe database access for Node.js and TypeScript. It abstracts SQL queries into intuitive, object-based operations.

See [ORM.md](./ORM.md) for general ORM concepts and comparisons.

## How Prisma Works in This Project

1. **Schema Definition** (`prisma/schema.prisma`):
   - Defines the `Moment` model with fields like `description`, `gpsLat`, `gpsLng`, etc.
   - Specifies SQLite as the database provider via `DATABASE_URL` from `.env`.

2. **Generated Client** (`src/generated/prisma/`):
   - Prisma generates TypeScript types and a client based on the schema.
   - Used in API routes for type-safe database operations.

3. **Client Setup** (`src/lib/prisma.js`):
   - Exports a singleton PrismaClient instance.
   - Prevents multiple instances during development hot-reload.

4. **CRUD Operations** (API Routes):
   - `src/app/api/moments/route.js`: Handles GET (all moments) and POST (create).
   - `src/app/api/moments/[id]/route.js`: Handles GET (single), PUT (update), DELETE.
   - These routes use Prisma Client for database interactions.

## Workflow

1. Edit `prisma/schema.prisma` to modify data models.
2. Run `npx prisma db push` to sync schema to SQLite database.
3. Use Prisma Client in API routes or components for CRUD operations.
4. Frontend calls these API endpoints to interact with data.

## Key Benefits

- **Type Safety**: Full TypeScript support with auto-generated types.
- **Easy Migrations**: `prisma db push` for quick schema updates.
- **Offline Support**: Integrated with your PWA's offline functionality.

## Common Commands

```bash
# Sync schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# View database in GUI
npx prisma studio
```
