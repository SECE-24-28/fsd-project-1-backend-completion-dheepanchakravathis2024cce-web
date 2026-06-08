const router = require('express').Router();
const { products } = require('../data/store');
const { adminAuth } = require('../middleware/auth');

// GET /api/products
router.get('/', (req, res) => {
  const { category, subcategory, search, sort } = req.query;
  let list = [...products];

  if (category) list = list.filter(p => p.category === category);
  if (subcategory) list = list.filter(p => p.subcategory === subcategory);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.subcategory.toLowerCase().includes(search.toLowerCase()));

  switch (sort) {
    case 'low':    list.sort((a, b) => a.price - b.price); break;
    case 'high':   list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
  }

  res.json(list);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/products (admin)
router.post('/', adminAuth, (req, res) => {
  const product = { id: products.length + 1, ...req.body, rating: 0, reviews: 0 };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
router.put('/:id', adminAuth, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

// DELETE /api/products/:id (admin)
router.delete('/:id', adminAuth, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Product not found' });
  products.splice(idx, 1);
  res.json({ message: 'Product deleted' });
});

module.exports = router;
