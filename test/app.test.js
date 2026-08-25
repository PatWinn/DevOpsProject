import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(options, callback) {
  const app = createApp(options);
  await new Promise((resolve) => app.listen(0, resolve));
  const { port } = app.address();
  try {
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => app.close((error) => error ? reject(error) : resolve()));
  }
}

test('health endpoint reports a healthy service', async () => {
  await withServer({}, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});

test('orders can be created and listed', async () => {
  await withServer({}, async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'keyboard', quantity: 2 })
    });
    assert.equal(createResponse.status, 201);

    const listResponse = await fetch(`${baseUrl}/api/orders`);
    assert.equal(listResponse.status, 200);
    assert.deepEqual((await listResponse.json()).orders, [
      { id: 1, product: 'keyboard', quantity: 2 }
    ]);
  });
});

test('database outage returns a service-unavailable response', async () => {
  await withServer({ databaseAvailable: false }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/orders`);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'database_unavailable');
  });
});
