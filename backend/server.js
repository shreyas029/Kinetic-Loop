const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { WebSocketServer, WebSocket } = require('ws');

const fs = require('fs');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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

// Allow the server to understand JSON
app.use(express.json());
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

// API endpoint to get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});



// First API endpoint
app.get('/', (req, res) => {
  res.send('KINETIC LOOP Backend is Running!');
});

// First API endpoint
app.get('/', (req, res) => {
  res.send('KINETIC LOOP Backend is Running!');
});



app.post('/api/orders', async (req, res) => {
  const { name, email, address, items } = req.body;

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

  const total = orderItems.reduce(
    (sum, item) => sum + item.price,
    0
  );

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
// Notify connected clients about a new order
const notification = JSON.stringify({
  type: 'NEW_ORDER',
  orderId: order.id,
  status: order.status
});

wss.clients.forEach((client) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(notification);
  }
});

if (wss) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(notification);
    }
  });
}
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


// Start the backend server

let wss;
async function startServer() {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    wss = new WebSocketServer({
      server,
      path: '/ws'
    });

    wss.on('connection', (socket) => {
      console.log('WebSocket client connected');

      socket.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'Connected to KINETIC LOOP live updates'
      }));

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

startServer();


