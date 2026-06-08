const router = require('express').Router();
const { orders, getNextOrderId } = require('../data/store');
const { auth, adminAuth } = require('../middleware/auth');

// POST /api/orders
router.post('/', auth, (req, res) => {
  const order = {
    id: 'ORD' + Date.now(),
    userId: req.user.id,
    ...req.body,
    status: 'Confirmed',
    date: new Date().toLocaleDateString('en-IN'),
    estimatedDelivery: new Date(Date.now() + 5 * 864e5).toLocaleDateString('en-IN'),
  };
  orders.push(order);
  res.status(201).json(order);
});

// GET /api/orders/my  — user's own orders
router.get('/my', auth, (req, res) => {
  res.json(orders.filter(o => o.userId === req.user.id).reverse());
});

// GET /api/orders (admin)
router.get('/', adminAuth, (req, res) => {
  res.json([...orders].reverse());
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', adminAuth, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = req.body.status;
  res.json(order);
});

module.exports = router;
