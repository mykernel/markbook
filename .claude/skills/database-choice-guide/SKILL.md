---
name: database-choice-guide
description: Database selection and implementation guide. Prioritizes MySQL for production projects, SQLite for prototyping/small projects, and CSV for data analysis. Covers MySQL setup, query patterns, SQLite usage, CSV operations, and migration strategies.
---

# Database Choice Guide

## Purpose

Provide practical database selection guidance and implementation patterns based on project scale and requirements.

## When to Use This Skill

Automatically activates when working on:
- Database selection and setup
- Database queries and operations
- Data persistence layer
- Migration between database types
- SQLite prototyping
- CSV data operations

---

## Database Selection Decision Tree

### 1. Production Applications → MySQL

**Use MySQL when:**
- ✅ Production web application
- ✅ Multi-user concurrent access needed
- ✅ Data integrity is critical
- ✅ Need transactions and ACID guarantees
- ✅ Data > 10MB or expected growth
- ✅ Team collaboration on same database

**Tech Stack:**
- `mysql2` - Node.js MySQL client
- `knex` - SQL query builder
- `mysql2/promise` - Promise-based API

---

### 2. Prototyping / Small Projects → SQLite

**Use SQLite when:**
- ✅ Rapid prototyping / MVP
- ✅ Single-user desktop applications
- ✅ Local development testing
- ✅ Embedded applications
- ✅ Small data (<100MB)
- ✅ No concurrent writes needed

**Tech Stack:**
- `better-sqlite3` - Fast synchronous SQLite
- `sqlite3` - Async SQLite (alternative)

---

### 3. Data Analysis / Simple Storage → CSV

**Use CSV when:**
- ✅ Data analysis and reporting
- ✅ Export/import functionality
- ✅ Simple tabular data
- ✅ No complex queries needed
- ✅ Human-readable data format
- ✅ Excel compatibility required

**Tech Stack:**
- `csv-parser` - CSV parsing
- `fast-csv` - CSV reading/writing
- `papaparse` - Browser + Node.js CSV

---

## Quick Start Examples

### MySQL Setup

```typescript
// db/mysql.ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Query helper
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
}
```

**Usage:**
```typescript
import { query } from './db/mysql';

interface User {
    id: number;
    name: string;
    email: string;
}

// Select
const users = await query<User>('SELECT * FROM users WHERE active = ?', [true]);

// Insert
await query('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);

// Transaction
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();
    await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [100, 1]);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [100, 2]);
    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}
```

---

### SQLite Setup

```typescript
// db/sqlite.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/app.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize tables
export function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
}

// Query helpers
export const prepare = {
    getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    createUser: db.prepare('INSERT INTO users (name, email) VALUES (?, ?)'),
    updateUser: db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?'),
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
};
```

**Usage:**
```typescript
import { db, prepare, initDatabase } from './db/sqlite';

// Initialize on startup
initDatabase();

// Select one
const user = prepare.getUserById.get(1);

// Select many
const users = db.prepare('SELECT * FROM users WHERE active = ?').all(1);

// Insert
const result = prepare.createUser.run('John', 'john@example.com');
console.log('Inserted ID:', result.lastInsertRowid);

// Transaction
const insertMany = db.transaction((users) => {
    for (const user of users) {
        prepare.createUser.run(user.name, user.email);
    }
});

insertMany([
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
]);
```

---

### CSV Operations

```typescript
// utils/csv.ts
import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

// Read CSV
export async function readCSV<T>(filePath: string): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Write CSV
export function writeCSV<T extends Record<string, any>>(
    filePath: string,
    data: T[],
    options?: { headers?: string[] }
): void {
    const csvString = stringify(data, {
        header: true,
        columns: options?.headers,
    });

    fs.writeFileSync(filePath, csvString);
}

// Append to CSV
export function appendToCSV<T extends Record<string, any>>(
    filePath: string,
    data: T[]
): void {
    const csvString = stringify(data, {
        header: !fs.existsSync(filePath), // Only add header if file doesn't exist
    });

    fs.appendFileSync(filePath, csvString);
}
```

**Usage:**
```typescript
import { readCSV, writeCSV, appendToCSV } from './utils/csv';

interface User {
    id: string;
    name: string;
    email: string;
}

// Read
const users = await readCSV<User>('./data/users.csv');
console.log(users);

// Write
writeCSV('./data/users.csv', [
    { id: '1', name: 'John', email: 'john@example.com' },
    { id: '2', name: 'Jane', email: 'jane@example.com' },
]);

// Append
appendToCSV('./data/users.csv', [
    { id: '3', name: 'Bob', email: 'bob@example.com' },
]);

// Filter and transform
const activeUsers = users.filter(u => u.email.includes('@company.com'));
writeCSV('./data/active_users.csv', activeUsers);
```

---

## Migration Strategies

### SQLite → MySQL (Prototype to Production)

```bash
# 1. Export SQLite to SQL
sqlite3 app.db .dump > dump.sql

# 2. Convert SQLite syntax to MySQL
sed -i 's/AUTOINCREMENT/AUTO_INCREMENT/g' dump.sql
sed -i 's/INTEGER PRIMARY KEY/INT PRIMARY KEY/g' dump.sql

# 3. Import to MySQL
mysql -u user -p database_name < dump.sql
```

**Code migration:**
```typescript
// Before (SQLite)
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

// After (MySQL)
const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
const user = users[0];
```

---

### CSV → SQLite (Data Import)

```typescript
import { readCSV } from './utils/csv';
import { db, prepare } from './db/sqlite';

async function importCSVtoSQLite(csvPath: string) {
    const records = await readCSV<{ name: string; email: string }>(csvPath);

    const insert = db.transaction((records) => {
        for (const record of records) {
            prepare.createUser.run(record.name, record.email);
        }
    });

    insert(records);
    console.log(`Imported ${records.length} records`);
}

await importCSVtoSQLite('./data/users.csv');
```

---

## Best Practices

### MySQL
- ✅ Use connection pooling
- ✅ Prepare statements for repeated queries
- ✅ Use transactions for multi-step operations
- ✅ Add indexes on frequently queried columns
- ✅ Use environment variables for credentials

### SQLite
- ✅ Enable WAL mode for concurrency
- ✅ Use prepared statements (pre-compile queries)
- ✅ Use transactions for bulk inserts (100x faster)
- ✅ Keep database file in `data/` directory (gitignored)
- ✅ Backup regularly (`db.backup()`)

### CSV
- ✅ Use streaming for large files (`csv-parser`)
- ✅ Validate data before writing
- ✅ Add timestamps to filename for versioning
- ✅ Use UTF-8 encoding
- ✅ Handle CSV injection (escape formulas)

---

## Error Handling

```typescript
// MySQL
try {
    const users = await query('SELECT * FROM users');
} catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User already exists');
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
        throw new Error('Database not initialized');
    }
    throw error;
}

// SQLite
try {
    const result = prepare.createUser.run('John', 'john@example.com');
} catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error('User already exists');
    }
    throw error;
}

// CSV
try {
    const data = await readCSV('./missing.csv');
} catch (error) {
    if (error.code === 'ENOENT') {
        console.log('CSV file not found, creating new...');
        writeCSV('./missing.csv', []);
    } else {
        throw error;
    }
}
```

---

## Package Installation

```bash
# MySQL
npm install mysql2

# SQLite
npm install better-sqlite3
npm install -D @types/better-sqlite3

# CSV
npm install csv-parser fast-csv
npm install -D @types/csv-parser
```

---

## When NOT to Use Each Option

### ❌ Don't use MySQL for:
- Single-user desktop apps
- Prototypes that need to move fast
- Embedded applications
- Apps that need zero-config deployment

### ❌ Don't use SQLite for:
- High-concurrency web apps
- Multi-server deployments
- Data > 1GB
- Apps requiring stored procedures

### ❌ Don't use CSV for:
- Complex relational data
- Frequent updates/deletes
- Concurrent access
- Data requiring indexing
- Binary data storage

---

## Resource Files

This skill is self-contained. All essential patterns are included above.

For ORM options, see:
- Prisma (if you need type safety + migrations)
- Knex (SQL query builder)
- TypeORM (full ORM)

**Recommendation**: Start simple with raw SQL. Add ORM only when complexity justifies it.
