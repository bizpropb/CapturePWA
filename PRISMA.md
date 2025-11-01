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

## Prisma Studio - Visual Database Editor

### What is Prisma Studio?

Prisma Studio is a web-based GUI that lets you view and edit your database visually without writing SQL queries. It's included with Prisma and provides an intuitive interface for database management.

### Launching Prisma Studio

```bash
npm run db:studio
# or
npx prisma studio
```

This opens a browser at `http://localhost:5555` with a visual interface.

### What You Can Do

1. **Browse Data**
   - View all tables (Moment, Tag, Category, User)
   - See relationships between records
   - Navigate linked data with click

2. **Edit Records**
   - Click any cell to edit inline
   - Auto-completes related IDs
   - Validates data types before saving

3. **Create Records**
   - Add new moments, tags, or categories
   - Set all fields in a form view
   - Automatically handles timestamps

4. **Delete Records**
   - Delete individual records with confirmation
   - Shows cascade delete warnings
   - Prevents orphaned relationships

5. **Filter & Search**
   - Filter by any field
   - Combine multiple conditions
   - Search text fields

6. **Advanced Features**
   - Sort by any column
   - Paginate large datasets
   - Export data as JSON
   - View SQL queries (debug mode)

### Use Cases in This Project

- **Debug Sync Issues**: Check if offline moments synced correctly
- **Manual Testing**: Add test data with specific edge cases
- **Data Cleanup**: Remove duplicate or invalid records
- **Verify Relations**: Ensure tags properly linked to moments
- **Database Inspection**: View actual database state during development
- **Seeding Verification**: Check if seed script populated data correctly

### Studio vs. Raw SQL

| Prisma Studio | Raw SQL |
|---------------|---------|
| Visual interface | Text commands |
| No syntax to remember | Must know SQL |
| Type validation | Manual validation |
| Relationship navigation | JOIN queries |
| Instant feedback | Query → Result cycle |
| Beginner-friendly | Requires SQL knowledge |

### Limitations

- **Performance**: Slow with very large datasets (10,000+ records)
- **Complex Queries**: Can't run custom aggregations or complex joins
- **No Migrations**: Can't modify schema, only data
- **Read-Only in Production**: Best for development/debugging

### Tips

- Keep Studio open while developing to inspect database state
- Use filters to find specific records quickly
- Check relations tab to understand data connections
- Use JSON view for complex nested data
- Compare Studio state with app UI to debug issues

## Common Commands

```bash
# Launch Prisma Studio (visual editor)
npm run db:studio

# Sync schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Reset database (delete all data)
npx prisma migrate reset

# Seed database with sample data
npm run db:seed
```
