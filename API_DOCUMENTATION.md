
# KINETIC LOOP — API Documentation

## 1. Project Overview

KINETIC LOOP is a prototype e-commerce platform for
energy-harvesting smartwatch straps.

### Technology Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Caching: Redis
- Real-time communication: WebSockets (`ws`)
- Bonus API: C++ with Crow Framework
- Hosting: Render
- CI testing: GitHub Actions

## 2. Backend Base URL

https://kinetic-loop-backend.onrender.com

## 3. REST API Endpoints

### GET /

Health check for the Node.js backend.

Example response:

KINETIC LOOP Backend is Running!

### GET /api/products

Returns the available smartwatch straps.

Response: JSON array of products.

Products:
- Solar Loop — ₹2,999
- Thermal Loop — ₹3,499
- Motion Loop — ₹3,999

Redis caching:
- Cache key: `kinetic-loop:products`
- Expiration: 300 seconds
- On a cache hit, products are returned from Redis.
- On a cache miss, the backend returns its product catalog
  and attempts to cache it.
- If Redis is unavailable, the endpoint still returns products.

### POST /api/orders

Creates a test order and stores it in PostgreSQL.

Content-Type: application/json

Example request:

```json
{
  "name": "Test Customer",
  "email": "test@example.com",
  "address": "Test Address Only",
  "items": [
    {
      "name": "Solar Loop"
    }
  ]
}
```

Success: HTTP 201

Example response:

```json
{
  "message": "Order placed successfully!",
  "order": {
    "id": "KL-example123",
    "name": "Test Customer",
    "email": "test@example.com",
    "address": "Test Address Only",
    "items": [
      {
        "id": 1,
        "name": "Solar Loop",
        "price": 2999
      }
    ],
    "total": 2999,
    "status": "Test order received"
  }
}
```

Possible errors:
- 400: Missing checkout details or invalid product
- 500: Database write failure

The backend validates the product against its catalog
and calculates the total server-side.

## 4. PostgreSQL Database

Table: `orders`

Columns:
- id: VARCHAR(100), primary key
- name: VARCHAR(255)
- email: VARCHAR(255)
- address: TEXT
- items: JSONB
- total: NUMERIC(10,2)
- status: VARCHAR(50)
- created_at: TIMESTAMPTZ

The table is initialized when the backend starts.

Connection environment variable:
`DATABASE_URL`

Do not commit database credentials to GitHub.

## 5. Redis Caching

Redis caches the product catalog for five minutes.

Environment variable:
`REDIS_URL`

The backend attempts to connect to Redis at startup.
Cache failures fall back to the normal product endpoint.

## 6. WebSocket API

Endpoint:

wss://kinetic-loop-backend.onrender.com/ws

### Connection message

Sent when a client connects:

```json
{
  "type": "CONNECTED",
  "message": "Connected to KINETIC LOOP live updates"
}
```

### New order notification

Broadcast after an order is saved successfully:

```json
{
  "type": "NEW_ORDER",
  "orderId": "KL-example123",
  "status": "Test order received"
}
```

The notification does not include customer name,
email, or address.

Note: The WebSocket endpoint currently has no
authentication. It is intended for demonstration only,
not for exposing production order activity.

## 7. Bonus C++ Crow Framework API

Source directory: `crow-api/`

Framework: Crow
Language standard: C++17

The API is compiled and tested using GitHub Actions.

### GET /

Returns a JSON health check.

### GET /api/energy/{steps}

Estimates motion-harvesting energy from a step count.

Example:

GET /api/energy/1000

Example response:

```json
{
  "steps": 1000,
  "estimated_energy_mWh": 0.5,
  "technology": "Motion Energy Harvesting",
  "note": "Illustrative estimate only"
}
```

Calculation:

estimated_energy_mWh = steps * 0.0005

This is a demonstration formula, not a validated
scientific measurement.

Negative step counts return HTTP 400.

The Crow API has been built and tested in GitHub Actions,
but is not currently hosted at a public URL.

## 8. Running the Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

The backend requires `DATABASE_URL` to connect to
PostgreSQL. Set `REDIS_URL` to enable caching.

### Crow API

Build on Linux using CMake:

```bash
cmake -S crow-api -B crow-api/build
cmake --build crow-api/build
./crow-api/build/kinetic-loop-crow
```

The build requires a C++17 compiler and Crow dependencies.

## 9. Deployment and Testing

- Frontend: Render Static Site
- Backend: Render Web Service
- PostgreSQL: Render PostgreSQL
- Redis: Render Key Value
- Crow CI: GitHub Actions

Completed checks:
- Frontend and backend deployed
- PostgreSQL initialized
- Test order accepted and saved
- Redis connection established
- WebSocket server started
- Crow API automated build and tests passed

Further checks:
- Verify Redis cache hits
- Verify WebSocket events using a client
- Complete production security hardening

## 10. Prototype Limitations

- Checkout is disabled in the frontend.
- No payment processing is implemented.
- The order API is not authenticated.
- WebSocket notifications are not authenticated.
- The Crow API is not publicly deployed.
- This project is an academic demonstration,
  not a production-ready e-commerce service.
