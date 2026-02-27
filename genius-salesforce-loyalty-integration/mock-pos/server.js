const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage
const products = [
  { id: 'item_001', name: 'Whataburger', price: 8.99, category: 'Burgers' },
  { id: 'item_002', name: 'Double Meat Whataburger', price: 11.99, category: 'Burgers' },
  { id: 'item_003', name: 'Jalapeño & Cheese Whataburger', price: 10.49, category: 'Burgers' },
  { id: 'item_004', name: 'French Fries - Small', price: 2.49, category: 'Sides' },
  { id: 'item_005', name: 'French Fries - Medium', price: 3.49, category: 'Sides' },
  { id: 'item_006', name: 'French Fries - Large', price: 4.49, category: 'Sides' },
  { id: 'item_007', name: 'Onion Rings', price: 3.99, category: 'Sides' },
  { id: 'item_008', name: 'Soft Drink - Small', price: 1.99, category: 'Drinks' },
  { id: 'item_009', name: 'Soft Drink - Medium', price: 2.49, category: 'Drinks' },
  { id: 'item_010', name: 'Soft Drink - Large', price: 2.99, category: 'Drinks' },
  { id: 'item_011', name: 'Shake - Chocolate', price: 4.99, category: 'Drinks' },
  { id: 'item_012', name: 'Shake - Vanilla', price: 4.99, category: 'Drinks' },
  { id: 'item_013', name: 'Shake - Strawberry', price: 4.99, category: 'Drinks' },
  { id: 'item_014', name: 'Chicken Strip Meal', price: 9.99, category: 'Chicken' },
  { id: 'item_015', name: 'Grilled Chicken Sandwich', price: 8.49, category: 'Chicken' },
];

const modifiers = [
  { id: 'mod_001', name: 'Extra Cheese', price: 0.50 },
  { id: 'mod_002', name: 'Bacon', price: 1.50 },
  { id: 'mod_003', name: 'Extra Patty', price: 2.50 },
  { id: 'mod_004', name: 'No Onions', price: 0.00 },
  { id: 'mod_005', name: 'No Pickles', price: 0.00 },
  { id: 'mod_006', name: 'Extra Jalapeños', price: 0.50 },
];

let transactions = [];

// Configuration
let config = {
  storeId: 'store_001',
  terminalId: 'terminal_001',
  webhookUrl: 'http://localhost:3000/api/webhooks/genius/transaction',
  webhookEnabled: true,
  taxRate: 0.0825, // 8.25% tax
};

// API Routes

// Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get modifiers
app.get('/api/modifiers', (req, res) => {
  res.json(modifiers);
});

// Get transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Get single transaction
app.get('/api/transactions/:id', (req, res) => {
  const transaction = transactions.find(t => t.transactionId === req.params.id);
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404).json({ error: 'Transaction not found' });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  const { items, customerPhone, customerEmail, customerId } = req.body;

  // Calculate totals
  let subtotal = 0;
  const processedItems = items.map(item => {
    const product = products.find(p => p.id === item.itemId);
    let itemTotal = product.price * item.quantity;
    
    // Add modifiers
    if (item.modifiers && item.modifiers.length > 0) {
      item.modifiers.forEach(modId => {
        const modifier = modifiers.find(m => m.id === modId);
        if (modifier) {
          itemTotal += modifier.price * item.quantity;
        }
      });
    }
    
    subtotal += itemTotal;
    
    return {
      itemId: product.id,
      itemName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice: itemTotal,
      categoryId: `cat_${product.category.toLowerCase()}`,
      categoryName: product.category,
      modifiers: item.modifiers ? item.modifiers.map(modId => {
        const mod = modifiers.find(m => m.id === modId);
        return {
          modifierId: mod.id,
          modifierName: mod.name,
          price: mod.price
        };
      }) : []
    };
  });

  const tax = subtotal * config.taxRate;
  const totalAmount = subtotal + tax;

  const transaction = {
    transactionId: `txn_${uuidv4().substring(0, 8)}`,
    storeId: config.storeId,
    terminalId: config.terminalId,
    timestamp: new Date().toISOString(),
    customerId: customerId || undefined,
    customerPhone: customerPhone || undefined,
    customerEmail: customerEmail || undefined,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    tip: 0.00,
    discount: 0.00,
    paymentMethod: 'credit_card',
    items: processedItems,
    status: 'completed'
  };

  transactions.unshift(transaction);

  // Send webhook if enabled
  if (config.webhookEnabled && config.webhookUrl) {
    try {
      await sendWebhook(transaction);
      transaction.webhookSent = true;
    } catch (error) {
      console.error('Failed to send webhook:', error.message);
      transaction.webhookSent = false;
      transaction.webhookError = error.message;
    }
  }

  res.json(transaction);
});

// Void transaction
app.post('/api/transactions/:id/void', async (req, res) => {
  const transaction = transactions.find(t => t.transactionId === req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  transaction.status = 'voided';
  transaction.voidedAt = new Date().toISOString();

  // Send void webhook
  if (config.webhookEnabled && config.webhookUrl) {
    try {
      await sendVoidWebhook(transaction);
      transaction.voidWebhookSent = true;
    } catch (error) {
      console.error('Failed to send void webhook:', error.message);
      transaction.voidWebhookSent = false;
      transaction.voidWebhookError = error.message;
    }
  }

  res.json(transaction);
});

// Get config
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Update config
app.put('/api/config', (req, res) => {
  config = { ...config, ...req.body };
  res.json(config);
});

// Clear transactions
app.delete('/api/transactions', (req, res) => {
  transactions = [];
  res.json({ message: 'All transactions cleared' });
});

// Helper functions
async function sendWebhook(transaction) {
  const webhookPayload = {
    eventType: 'transaction.created',
    eventId: `evt_${uuidv4().substring(0, 8)}`,
    timestamp: new Date().toISOString(),
    data: transaction
  };

  console.log('Sending webhook to:', config.webhookUrl);
  console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

  const response = await axios.post(config.webhookUrl, webhookPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000
  });

  console.log('Webhook response:', response.status, response.data);
  return response.data;
}

async function sendVoidWebhook(transaction) {
  const voidWebhookUrl = config.webhookUrl.replace('/transaction', '/void');
  
  const webhookPayload = {
    eventType: 'transaction.voided',
    eventId: `evt_${uuidv4().substring(0, 8)}`,
    timestamp: new Date().toISOString(),
    data: transaction
  };

  console.log('Sending void webhook to:', voidWebhookUrl);
  const response = await axios.post(voidWebhookUrl, webhookPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000
  });

  return response.data;
}

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('Mock Genius POS Server');
  console.log('========================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Store ID: ${config.storeId}`);
  console.log(`Terminal ID: ${config.terminalId}`);
  console.log(`Webhook URL: ${config.webhookUrl}`);
  console.log('========================================');
});
