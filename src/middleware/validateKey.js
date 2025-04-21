import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const apiUrl = req.headers['x-api-url'];

  if (!apiKey || !apiUrl) {
    return res.status(401).json({ message: 'Missing API key or URL.' });
  }

  const user = await prisma.user.findFirst({
    where: { apiKey, apiUrl },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid API credentials.' });
  }

  if (user.credits <= 0) {
    return res.status(403).json({ message: 'Request limit exceeded. Please recharge credits.' });
  }

  req.user = user;
  next();
}
