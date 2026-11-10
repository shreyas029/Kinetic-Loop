
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');
const { createClient } = require('redis');

// Initialize the Express application and server port.
const app = express();
const PORT = process.env.PORT || 5000;

// Enable cross-origin requests from the frontend.
app.use(cors());

// Parse incoming JSON request bodies.
app.use(express.json());

// Configure the PostgreSQL connection pool.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Configure Redis for product caching.
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// Log Redis errors without stopping the application.
redisClient.on('error', (error) => {
  console.error('Redis error:', error.message);
});

// Create the orders table if it does not already exist.
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        items JSONB NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Order received',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('PostgreSQL orders table ready');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

// Demo product catalog used by the storefront and checkout.
const products = [
  {
    id: 1,
    name: 'Solar Loop',
    technology: 'Solar Technology',
    description: 'Harness energy from sunlight.',
    price: 2999,
    image: '/images/solar loop.jpg'
  },
  {
    id: 2,
    name: 'Thermal Loop',
    technology: 'Thermoelectric',
    description: 'Harvest energy from body heat.',
    price: 3499,
    image: '/images/thermal loop.jpg'
  },
  {
    id: 3,
    name: 'Motion Loop',
    technology: 'Motion Technology',
    description: 'Capture energy from wrist movement.',
    price: 3999,
    image: '/images/motion loop.jpg'
  }
];

// GET /api/products
// Return the product catalog, using Redis when available.
app.get('/api/products', async (req, res) => {
  const cacheKey = 'kinetic-loop:products';

  // Check Redis for a previously cached product catalog.
  if (redisClient.isReady) {
    try {
      const cachedProducts = await redisClient.get(cacheKey);

      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
      }
    } catch (error) {
      console.error('Redis read error:', error.message);
    }
  }

  // Cache the catalog for 300 seconds (5 minutes).
  if (redisClient.isReady) {
    try {
      await redisClient.setEx(
        cacheKey,
        300,
        JSON.stringify(products)
      );
    } catch (error) {
      console.error('Redis write error:', error.message);
    }
  }

  // Return products directly if no cache entry is available.
  res.json(products);
});

// GET /
// Simple endpoint to confirm that the backend is running.
app.get('/', (req, res) => {
  res.send('KINETIC LOOP Backend is Running!');
});

// WebSocket server reference, initialized during startup.
let wss;

// POST /api/orders
// Validate checkout details, save an order, and notify clients.
app.post('/api/orders', async (req, res) => {
  const { name, email, address, items } = req.body;

  // Ensure all required checkout fields are provided.
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof address !== 'string' || !address.trim() ||
    !Array.isArray(items) || items.length === 0
  ) {
    return res.status(400).json({
      message: 'Please provide all checkout details.'
    });
  }

  const orderItems = [];

  // Validate products against the server-side catalog.
  // Product prices are taken from the server, not the client.
  for (const item of items) {
    if (!item || typeof item.name !== 'string') {
      return res.status(400).json({
        message: 'Invalid product in order.'
      });
    }

    const product = products.find(
      (p) => p.name === item.name
    );

    if (!product) {
      return res.status(400).json({
        message: 'Invalid product in order.'
      });
    }

    orderItems.push({
      id: product.id,
      name: product.name,
      price: product.price
    });
  }

  // Calculate the total using validated product prices.
  const total = orderItems.reduce(
    (sum, item) => sum + item.price,
    0
  );

  // Prepare the demo order for database storage.
  const order = {
    id: `KL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: email.trim(),
    address: address.trim(),
    items: orderItems,
    total,
    status: 'Test order received'
  };

  try {
    // Save the order using a parameterized PostgreSQL query.
    await pool.query(
      `INSERT INTO orders
       (id, name, email, address, items, total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        order.id,
        order.name,
        order.email,
        order.address,
        JSON.stringify(order.items),
        order.total,
        order.status
      ]
    );

    // Notify connected WebSocket clients about the new order.
    const notification = JSON.stringify({
      type: 'NEW_ORDER',
      orderId: order.id,
      status: order.status
    });

    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(notification);
        }
      });
    }

    // Confirm that the order was saved successfully.
    res.status(201).json({
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    console.error('Failed to save order:', error.message);

    res.status(500).json({
      message: 'Unable to save order. Please try again.'
    });
  }
});

// Initialize dependencies and start the HTTP/WebSocket server.
async function startServer() {
  try {
    // Ensure the PostgreSQL orders table exists.
    await initializeDatabase();

    // Connect to Redis when a connection URL is configured.
    if (process.env.REDIS_URL) {
      try {
        await redisClient.connect();
        console.log('Redis connected successfully');
      } catch (error) {
        console.error('Redis connection failed:', error.message);
      }
    }

    // Start the Express HTTP server.
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Attach the WebSocket server to the existing HTTP server.
    wss = new WebSocketServer({
      server,
      path: '/ws'
    });

    // Handle new WebSocket client connections.
    wss.on('connection', (socket) => {
      console.log('WebSocket client connected');

      // Confirm the WebSocket connection to the client.
      socket.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Connected to KINETIC LOOP live updates'
      }));

      // Log client disconnections.
      socket.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    console.log('WebSocket server ready at /ws');
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

// Start the application.
startServer();
