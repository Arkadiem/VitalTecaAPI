import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL no está definido en el archivo .env');
}

const libsql = createClient({ url, authToken });

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await libsql.execute(`PRAGMA table_info("${table}")`);
  return result.rows.some((row: any) => row[1] === column);
}

async function ensureTableUser() {
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL,
      "email"     TEXT NOT NULL,
      "password"  TEXT NOT NULL DEFAULT '',
      "role"      TEXT NOT NULL DEFAULT 'CLIENT',
      "isActive"  BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await libsql.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `);

  if (!(await columnExists('User', 'password'))) {
    await libsql.execute(`ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT ''`);
  }
  if (!(await columnExists('User', 'role'))) {
    await libsql.execute(`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CLIENT'`);
  }
  if (!(await columnExists('User', 'createdAt'))) {
    await libsql.execute(`ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
  if (!(await columnExists('User', 'updatedAt'))) {
    await libsql.execute(`ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
}

async function ensureTableEmployee() {
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Employee" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL,
      "email"     TEXT NOT NULL,
      "password"  TEXT NOT NULL DEFAULT '',
      "role"      TEXT NOT NULL DEFAULT 'EMPLOYEE',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await libsql.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");
  `);

  if (!(await columnExists('Employee', 'password'))) {
    await libsql.execute(`ALTER TABLE "Employee" ADD COLUMN "password" TEXT NOT NULL DEFAULT ''`);
  }
  if (!(await columnExists('Employee', 'createdAt'))) {
    await libsql.execute(`ALTER TABLE "Employee" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
  if (!(await columnExists('Employee', 'updatedAt'))) {
    await libsql.execute(`ALTER TABLE "Employee" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
}

async function ensureTableBook() {
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Book" (
      "id"     TEXT NOT NULL PRIMARY KEY,
      "title"  TEXT NOT NULL,
      "author" TEXT NOT NULL,
      "isbn"   TEXT NOT NULL,
      "stock"  INTEGER NOT NULL DEFAULT 0
    );
  `);
  await libsql.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Book_isbn_key" ON "Book"("isbn");
  `);
}

async function ensureTableLoan() {
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Loan" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "bookId"     TEXT NOT NULL,
      "userId"     TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "borrowDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "returnDate" DATETIME,
      CONSTRAINT "Loan_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Loan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
}

async function ensureTableInventory() {
  await libsql.execute(`
    CREATE TABLE IF NOT EXISTS "Inventory" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "bookId"     TEXT NOT NULL,
      "employeeId" TEXT NOT NULL,
      "status"     TEXT NOT NULL DEFAULT 'GOOD',
      "checkDate"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Inventory_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Inventory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);
}

async function migrateAndSeed() {
  console.log('Conectando a Turso:', url);
  console.log('Asegurando tablas...\n');

  await ensureTableUser();
  await ensureTableEmployee();
  await ensureTableBook();
  await ensureTableLoan();
  await ensureTableInventory();

  console.log('Tablas verificadas. Sembrando datos...\n');

  // ─── Employees ───
  const adminPass = await bcrypt.hash('admin123', 10);
  const libPass1 = await bcrypt.hash('librarian123', 10);
  const libPass2 = await bcrypt.hash('librarian456', 10);

  const empAdminId = randomUUID();
  const empLib1Id = randomUUID();
  const empLib2Id = randomUUID();

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Employee" (id, name, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [empAdminId, 'Admin Bibliotecario', 'admin@biblioteca.com', adminPass, 'ADMIN'],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Employee" (id, name, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [empLib1Id, 'Laura García', 'laura@biblioteca.com', libPass1, 'EMPLOYEE'],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Employee" (id, name, email, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [empLib2Id, 'Carlos Pérez', 'carlos@biblioteca.com', libPass2, 'EMPLOYEE'],
  });

  // ─── Users ───
  const userPass1 = await bcrypt.hash('alice123', 10);
  const userPass2 = await bcrypt.hash('bob123', 10);
  const userPass3 = await bcrypt.hash('charlie123', 10);

  const userId1 = randomUUID();
  const userId2 = randomUUID();
  const userId3 = randomUUID();

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, password, role, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'CLIENT', 1, datetime('now'), datetime('now'))`,
    args: [userId1, 'Alice Smith', 'alice@example.com', userPass1],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, password, role, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'CLIENT', 1, datetime('now'), datetime('now'))`,
    args: [userId2, 'Bob Johnson', 'bob@example.com', userPass2],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "User" (id, name, email, password, role, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'CLIENT', 1, datetime('now'), datetime('now'))`,
    args: [userId3, 'Charlie Brown', 'charlie@example.com', userPass3],
  });

  // ─── Books ───
  const book1Id = randomUUID();
  const book2Id = randomUUID();
  const book3Id = randomUUID();

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Book" (id, title, author, isbn, stock) VALUES (?, ?, ?, ?, ?)`,
    args: [book1Id, '1984', 'George Orwell', '978-0451524935', 5],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Book" (id, title, author, isbn, stock) VALUES (?, ?, ?, ?, ?)`,
    args: [book2Id, 'Don Quijote de la Mancha', 'Miguel de Cervantes', '978-8420471843', 3],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Book" (id, title, author, isbn, stock) VALUES (?, ?, ?, ?, ?)`,
    args: [book3Id, 'Cien Años de Soledad', 'Gabriel García Márquez', '978-0307474728', 10],
  });

  // ─── Loans (usando los IDs generados arriba) ───
  const loan1Id = randomUUID();
  const loan2Id = randomUUID();
  const loan3Id = randomUUID();

  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Loan" (id, bookId, userId, employeeId, borrowDate, returnDate)
          VALUES (?, ?, ?, ?, datetime('now', '-7 days'), datetime('now', '-1 days'))`,
    args: [loan1Id, book1Id, userId1, empLib1Id],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Loan" (id, bookId, userId, employeeId, borrowDate)
          VALUES (?, ?, ?, ?, datetime('now', '-3 days'))`,
    args: [loan2Id, book2Id, userId2, empLib1Id],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Loan" (id, bookId, userId, employeeId, borrowDate)
          VALUES (?, ?, ?, ?, datetime('now', '-1 days'))`,
    args: [loan3Id, book3Id, userId3, empLib2Id],
  });

  // ─── Inventory ───
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Inventory" (id, bookId, employeeId, status, checkDate)
          VALUES (?, ?, ?, 'GOOD', datetime('now', '-15 days'))`,
    args: [randomUUID(), book1Id, empAdminId],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Inventory" (id, bookId, employeeId, status, checkDate)
          VALUES (?, ?, ?, 'DAMAGED', datetime('now', '-10 days'))`,
    args: [randomUUID(), book2Id, empLib1Id],
  });
  await libsql.execute({
    sql: `INSERT OR IGNORE INTO "Inventory" (id, bookId, employeeId, status, checkDate)
          VALUES (?, ?, ?, 'GOOD', datetime('now', '-5 days'))`,
    args: [randomUUID(), book3Id, empLib2Id],
  });

  console.log('--- IDs de Registros Creados ---');
  console.log(`\nEmpleados:`);
  console.log(`  Admin:      ${empAdminId}`);
  console.log(`  Laura:      ${empLib1Id}`);
  console.log(`  Carlos:     ${empLib2Id}`);
  console.log(`\nUsuarios:`);
  console.log(`  Alice:      ${userId1}`);
  console.log(`  Bob:        ${userId2}`);
  console.log(`  Charlie:    ${userId3}`);
  console.log(`\nLibros:`);
  console.log(`  1984:       ${book1Id}`);
  console.log(`  Quijote:    ${book2Id}`);
  console.log(`  Soledad:    ${book3Id}`);
  console.log(`\nPréstamos:`);
  console.log(`  Loan 1:     ${loan1Id} (devuelto)`);
  console.log(`  Loan 2:     ${loan2Id} (activo)`);
  console.log(`  Loan 3:     ${loan3Id} (activo)`);

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   CREDENCIALES DE PRUEBA                ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Admin    → admin@biblioteca.com / admin123  ║');
  console.log('║  Empleado → laura@biblioteca.com / librarian123 ║');
  console.log('║  Empleado → carlos@biblioteca.com / librarian456 ║');
  console.log('║  Cliente  → alice@example.com / alice123     ║');
  console.log('║  Cliente  → bob@example.com / bob123         ║');
  console.log('║  Cliente  → charlie@example.com / charlie123 ║');
  console.log('╚══════════════════════════════════════════╝');

  console.log('\nMigración y Seed completados con éxito.');
}

migrateAndSeed().catch((e) => {
  console.error('Error durante el seed:', e);
  process.exit(1);
});
