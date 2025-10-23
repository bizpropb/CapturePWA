# Object-Relational Mapping (ORM)

## What is an ORM?

An ORM (Object-Relational Mapping) is a programming technique that converts data between incompatible type systems: your programming language's objects and a relational database's tables.

Instead of writing raw SQL queries, you work with objects in your code, and the ORM translates those operations into SQL behind the scenes.

**This project uses Prisma, which is an ORM.** See [PRISMA.md](./PRISMA.md) for Prisma-specific documentation.

## Without ORM (Raw SQL)

```javascript
// Raw SQL query
const users = await db.query('SELECT * FROM users WHERE age > 18');

// Insert
await db.query('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);

// Update
await db.query('UPDATE users SET email = ? WHERE id = ?', ['newemail@example.com', 5]);

// Joins
await db.query(`
  SELECT posts.*, users.name
  FROM posts
  JOIN users ON posts.user_id = users.id
  WHERE users.id = ?
`, [userId]);
```

## With ORM

```javascript
// Query
const users = await User.findMany({ where: { age: { gt: 18 } } });

// Insert
await User.create({ name: 'John', email: 'john@example.com' });

// Update
await User.update({ where: { id: 5 }, data: { email: 'newemail@example.com' } });

// Joins (relations)
const posts = await Post.findMany({
  include: { user: true },
  where: { userId: userId }
});
```

## Benefits of ORMs

### 1. Type Safety
- Autocomplete in your IDE
- Catch errors at compile/build time
- Know exactly what fields exist on models

### 2. Database Agnostic
- Switch databases without rewriting queries
- Same code works with SQLite, PostgreSQL, MySQL, etc.

### 3. Easier to Read/Write
- Code looks like regular object manipulation
- No need to remember SQL syntax
- Less error-prone

### 4. Security
- Automatic SQL injection prevention
- Parameterized queries by default

### 5. Migrations
- Track database schema changes
- Version control for database structure
- Rollback capabilities

### 6. Relations
- Easy handling of relationships (one-to-many, many-to-many)
- Automatic joins
- Eager/lazy loading

## Drawbacks of ORMs

### 1. Performance Overhead
- Generated SQL may not be optimal
- Complex queries can be slower than hand-written SQL
- Extra abstraction layer

### 2. Learning Curve
- Need to learn ORM-specific syntax
- Abstractions can be "leaky" (need to understand SQL anyway)

### 3. Complex Queries
- Some advanced SQL features hard to express in ORM
- May need raw SQL for complex operations

### 4. Limited Control
- Less control over exact SQL generated
- Optimization harder when ORM generates query

## Popular JavaScript/TypeScript ORMs

### Prisma (Modern, Type-Safe)
- Schema-first approach
- Excellent TypeScript support
- Built-in migrations
- Great developer experience

### TypeORM
- Similar to Java's Hibernate
- Decorator-based
- Supports Active Record and Data Mapper patterns

### Sequelize
- Mature, widely used
- Promise-based
- Supports many databases

### Drizzle
- Lightweight, modern
- SQL-like syntax
- Good performance

### Knex.js (Query Builder, not full ORM)
- Flexible query builder
- Lower-level than full ORMs
- More SQL-like

## When to Use an ORM

### Good Use Cases
- Standard CRUD operations
- Applications with many simple queries
- Projects needing database flexibility
- Teams wanting type safety
- Rapid prototyping

### When to Skip ORM
- High-performance requirements
- Complex analytical queries
- Very simple apps (overkill)
- Working with legacy databases with complex schemas
- Need precise control over every query

## ORM Query Examples

### Simple CRUD

```javascript
// Create
await prisma.user.create({
  data: { name: 'Alice', email: 'alice@example.com' }
});

// Read
const user = await prisma.user.findUnique({ where: { id: 1 } });
const users = await prisma.user.findMany();

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' }
});

// Delete
await prisma.user.delete({ where: { id: 1 } });
```

### Filtering & Sorting

```javascript
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18, lte: 65 },
    email: { contains: '@example.com' }
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 20
});
```

### Relations

```javascript
// Get user with all their posts
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
});

// Create user with posts in one operation
await prisma.user.create({
  data: {
    name: 'Bob',
    posts: {
      create: [
        { title: 'First Post' },
        { title: 'Second Post' }
      ]
    }
  }
});
```

## Common ORM Patterns

### Active Record
Model instances have methods to save/update themselves:
```javascript
const user = new User();
user.name = 'John';
user.save(); // Saves to database
```

### Data Mapper
Separate repository handles database operations:
```javascript
const user = { name: 'John' };
await userRepository.save(user);
```

### Query Builder
Fluent interface for building queries:
```javascript
const users = await db('users')
  .where('age', '>', 18)
  .orderBy('name')
  .limit(10);
```

## This Project's ORM Choice: Prisma

We use Prisma because:
- Excellent TypeScript/JavaScript support
- Simple, readable schema syntax
- Built-in migrations
- Great developer experience with Prisma Studio
- Type-safe database queries
- Good documentation

See [PRISMA.md](./PRISMA.md) for Prisma-specific details.

## Resources

- [Wikipedia: ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)
- [Prisma: Why ORMs?](https://www.prisma.io/docs/concepts/overview/why-prisma)
- [ORM vs Raw SQL Comparison](https://www.prisma.io/dataguide/types/relational/comparing-sql-query-builders-and-orms)
