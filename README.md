
# KINETIC LOOP

### Energy-Harvesting Smartwatch Strap E-Commerce Platform

KINETIC LOOP is a full-stack academic prototype for an
e-commerce website selling energy-harvesting smartwatch
straps.

The application demonstrates product browsing, a shopping
cart, demo checkout, PostgreSQL order storage, Redis caching,
real-time WebSocket notifications, and a bonus C++ Crow API.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Caching | Redis |
| Real-time Communication | WebSockets (ws) |
| Bonus API | C++17, Crow Framework |
| Hosting | Render |
| CI Testing | GitHub Actions |
| Version Control | Git, GitHub |

## Features

- Responsive product catalog
- Solar Loop, Thermal Loop, and Motion Loop products
- Shopping cart and order total calculation
- Demo checkout and order confirmation
- Persistent order storage using PostgreSQL
- Redis product caching with a 300-second expiration
- Real-time WebSocket order notifications
- Bonus energy-harvesting estimation API in C++
- Automated Crow API build and testing

## Project Structure

```text
kinetic-loop/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── backend/
│   ├── server.js
│   └── package.json
├── crow-api/
│   ├── main.cpp
│   └── CMakeLists.txt
├── .github/
│   └── workflows/
│       └── crow-build.yml
├── API_DOCUMENTATION.md
└── README.md
```

## Prerequisites

To run the frontend and backend locally, install:

- Node.js and npm
- Git
- Access to a PostgreSQL database
- Access to Redis (optional for local development)

To compile the C++ bonus API, use a Linux environment
with a C++17 compiler, CMake, and the required dependencies.

## Frontend Setup

Open a terminal in the project root.

```bash
cd frontend
npm install
npm run dev
```

Vite will display a local development URL, typically:

http://localhost:5173

Open that URL in your browser.

To build the frontend:

```bash
npm run build
```

## Backend Setup

Open a separate terminal in the project root.

```bash
cd backend
npm install
```

Configure the following environment variables:

| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL connection string |
| REDIS_URL | Redis connection string |
| PORT | Optional server port (default 5000) |

For local development, create a `backend/.env` file
containing your own connection strings.

Example (replace placeholders with your credentials):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
REDIS_URL=redis://HOST:6379
PORT=5000
```

The current backend reads environment variables from
`process.env`. A local `.env` file must be loaded using
Node.js environment-file support or another compatible
method.

For example, with a supported Node.js version:

```bash
node --env-file=.env server.js
```

Alternatively, configure the variables in your terminal
or hosting environment.

Never commit `.env` files or real credentials to GitHub.

Start the backend:

```bash
npm start
```

The backend initializes the PostgreSQL orders table
during startup.

Note: The frontend currently uses the deployed Render
backend URL. To use a local backend, update the API
URLs in `frontend/src/App.jsx`.

## PostgreSQL

PostgreSQL stores customer test orders in the `orders`
table.

The table is created automatically when the backend
starts, if it does not already exist.

The backend uses parameterized SQL queries for order
insertion.

## Redis Caching

The `/api/products` endpoint caches the product catalog
in Redis.

- Cache key: `kinetic-loop:products`
- Expiration: 300 seconds
- Cache failures fall back to the normal product catalog

Redis connection is configured using `REDIS_URL`.

## WebSockets

The Node.js backend provides a WebSocket endpoint:

wss://kinetic-loop-backend.onrender.com/ws

On connection, the client receives a `CONNECTED` event.

After a successful test order, connected clients receive
a `NEW_ORDER` notification containing the order ID and
status.

The WebSocket endpoint is intended for demonstration
and does not currently require authentication.

## Bonus: C++ Crow Framework API

The bonus API is located in `crow-api/`.

Endpoints:

- GET /
- GET /api/energy/{steps}

Example:

GET /api/energy/1000

The API returns an illustrative estimate of motion
energy harvesting.

This is a demonstration formula, not a scientifically
validated energy measurement.

### Build on Linux

Install a C++17 compiler, CMake, Git, and the required
Asio and SSL development packages.

From the project root:

```bash
cmake -S crow-api -B crow-api/build
cmake --build crow-api/build
./crow-api/build/kinetic-loop-crow
```

The Crow API uses port 8080 by default.

### Automated Testing

GitHub Actions automatically builds and tests the Crow
API when changes are pushed to the `dev` branch.

Workflow file:

`.github/workflows/crow-build.yml`

The Crow API is tested in CI but is not currently
deployed as a public web service.

## API Documentation

Detailed REST API, WebSocket, PostgreSQL, Redis, and
Crow endpoint information is available in:

[API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Live Deployment

Frontend:
https://kinetic-loop-frontend.onrender.com/

Backend:
https://kinetic-loop-backend.onrender.com/

Products API:
https://kinetic-loop-backend.onrender.com/api/products

Source code:
https://github.com/shreyas029/Kinetic-Loop/tree/dev

GitHub Actions:
https://github.com/shreyas029/Kinetic-Loop/actions

Render free services may take additional time to
respond after periods of inactivity.

## Testing

The following tests have been completed:

- Frontend production build
- Backend JavaScript syntax check
- PostgreSQL initialization
- Successful test order insertion
- Product API responses
- Redis connection
- WebSocket connection
- Real-time NEW_ORDER notification
- Crow API compilation and automated endpoint tests
- Live frontend demo checkout

Redis cache hits have not been independently verified.

## Important Limitations

KINETIC LOOP is an academic prototype.

- Checkout creates test orders only.
- No real payment processing is implemented.
- The order endpoint is not authenticated.
- WebSocket notifications are not authenticated.
- The Crow API is not publicly deployed.
- Do not enter real customer or payment information.

Production deployment would require authentication,
authorization, stronger input validation, rate limiting,
and additional security controls.

## Project Status

The main assignment technology requirements have been
implemented, and the C++ Crow bonus API has passed
automated build and endpoint tests.
