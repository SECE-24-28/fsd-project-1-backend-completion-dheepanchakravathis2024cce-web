const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { users } = require('../data/store');
const { auth, adminAuth } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// PUT /api/users/me
router.put('/me', auth, (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const { password, ...updates } = req.body;
  users[idx] = { ...users[idx], ...updates };
  const { password: pw, ...safe } = users[idx];
  res.json(safe);
});

// PUT /api/users/me/password
router.put('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user.id);
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
  user.password = await bcrypt.hash(newPassword, 10);
  res.json({ message: 'Password updated successfully' });
});

// GET /api/users (admin)
router.get('/', adminAuth, (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

// PUT /api/users/:id/block (admin)
router.put('/:id/block', adminAuth, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.blocked = !user.blocked;
  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;
