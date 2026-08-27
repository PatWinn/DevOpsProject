import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/database.js';

const databaseUrl = process.env.DATABASE_URL ?? 'postgres://devopslab:devopslab@localhost:5432/devopslab';

async function withServer(callback) {
  const database = createDatabase(databaseUrl);
  await database.initialize();

  const app = createApp({ repository: database });
  await new Promise((resolve) => app.listen(0, resolve));
  const { port } = app.address();

  try {
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve()));
    await database.close();
  }
}

test('API persists orders in PostgreSQL', { skip: process.env.RUN_INTEGRATION !== 'true' }, async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'laptop', quantity: 1 })
    });

    assert.equal(createResponse.status, 201);
    const createdOrder = await createResponse.json();
    assert.deepEqual(createdOrder, {
      id: createdOrder.id,
      product: 'laptop',
      quantity: 1
    });

    const listResponse = await fetch(`${baseUrl}/api/orders`);
    assert.equal(listResponse.status, 200);
    const listedOrders = await listResponse.json();
    assert.ok(listedOrders.orders.some((order) => order.id === createdOrder.id));
  });
});