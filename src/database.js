import pg from 'pg';

const { Pool } = pg;

export function createDatabase(databaseUrl) {
  const pool = new Pool({ connectionString: databaseUrl });

  return {
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          product TEXT NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0)
        )
      `);
    },
    async listOrders() {
      const result = await pool.query(
        'SELECT id, product, quantity FROM orders ORDER BY id'
      );
      return result.rows;
    },
    async createOrder({ product, quantity }) {
      const result = await pool.query(
        'INSERT INTO orders (product, quantity) VALUES ($1, $2) RETURNING id, product, quantity',
        [product, quantity]
      );
      return result.rows[0];
    },
    async close() {
      await pool.end();
    }
  };
}