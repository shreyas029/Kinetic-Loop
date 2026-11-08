const express = require('express');
const cors = require('cors');

const fs = require('fs');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

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

const ordersFile = path.join(__dirname, 'orders.json');

let orders = [];

if (fs.existsSync(ordersFile)) {
  orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
}
app.post('/api/orders', (req, res) => {
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
    id: `KL-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    address: address.trim(),
    items: orderItems,
    total,
    status: 'Test order received'
  };

  orders.push(order);
  fs.writeFileSync(
  ordersFile,
  JSON.stringify(orders, null, 2)
  );


  res.status(201).json({
    message: 'Order placed successfully!',
    order
  });
});

// Start the backend server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
