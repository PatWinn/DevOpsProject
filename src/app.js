import http from 'node:http';

function createMemoryRepository() {
  const orders = [];

  return {
    async listOrders() {
      return orders;
    },
    async createOrder({ product, quantity }) {
      const order = { id: orders.length + 1, product, quantity };
      orders.push(order);
      return order;
    }
  };
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

export function createApp({ databaseAvailable = true, repository = createMemoryRepository() } = {}) {
  return http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { status: 'ok' });
    }

    if (request.method === 'GET' && url.pathname === '/api/orders') {
      if (!databaseAvailable) {
        return sendJson(response, 503, {
          error: 'database_unavailable',
          message: 'Order service is temporarily unavailable'
        });
      }

      repository.listOrders()
        .then((orders) => sendJson(response, 200, { orders }))
        .catch(() => sendJson(response, 503, {
          error: 'database_unavailable',
          message: 'Order service is temporarily unavailable'
        }));
      return undefined;
    }

    if (request.method === 'POST' && url.pathname === '/api/orders') {
      if (!databaseAvailable) {
        return sendJson(response, 503, {
          error: 'database_unavailable',
          message: 'Order service is temporarily unavailable'
        });
      }

      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {
        try {
          const order = JSON.parse(body);
          if (!order.product || !Number.isInteger(order.quantity) || order.quantity < 1) {
            return sendJson(response, 400, { error: 'invalid_order' });
          }

          return repository.createOrder(order)
            .then((savedOrder) => sendJson(response, 201, savedOrder))
            .catch(() => sendJson(response, 503, {
              error: 'database_unavailable',
              message: 'Order service is temporarily unavailable'
            }));
        } catch {
          return sendJson(response, 400, { error: 'invalid_json' });
        }
      });
      return undefined;
    }

    return sendJson(response, 404, { error: 'not_found' });
  });
}
