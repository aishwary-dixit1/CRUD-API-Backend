import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validateApiKey } from '../middleware/validateKey.js';

const prisma = new PrismaClient();
const router = express.Router();

// Decrease credit function
async function decrementCredit(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: 1 } },
  });
}

// Create
router.post('/', validateApiKey, async (req, res) => {
  const { value, txHash } = req.body;
  const { user } = req;

  if (!value || !txHash) {
    return res.status(400).json({ message: 'Missing value or txHash' });
  }

  const todo = await prisma.todo.create({
    data: {
      value,
      txHash,
      userId: user.id,
    },
  });

  await decrementCredit(user.id);

  res.json({ id: todo.id, status: 'created successfully' });
});

// Read
router.get('/:id', validateApiKey, async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  });

  if (!todo || todo.userId !== req.user.id) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  await decrementCredit(req.user.id);

  res.json({ value: todo.value, txHash: todo.txHash });
});

// Update
router.put('/:id', validateApiKey, async (req, res) => {
  const { value } = req.body;

  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  });

  if (!todo || todo.userId !== req.user.id) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  await prisma.todo.update({
    where: { id: req.params.id },
    data: { value },
  });

  await decrementCredit(req.user.id);

  res.json({ status: 'updated successfully' });
});

// Delete
router.delete('/:id', validateApiKey, async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: { id: req.params.id },
  });

  if (!todo || todo.userId !== req.user.id) {
    return res.status(404).json({ message: 'Todo not found.' });
  }

  await prisma.todo.delete({
    where: { id: req.params.id },
  });

  await decrementCredit(req.user.id);

  res.json({ status: 'deleted successfully' });
});

export default router;
