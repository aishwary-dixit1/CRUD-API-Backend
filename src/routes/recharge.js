import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.recharged) {
    return res.status(403).json({
      message: 'Credits exhausted. Cannot recharge again.',
    });
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      credits: { increment: 4 },
      recharged: true,
    },
  });

  res.json({
    message: 'Credits recharged successfully',
    newCredits: updatedUser.credits,
  });
});

export default router;
