import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import cookieParser from "cookie-parser";

import authRoutes from './routes/auth.js';
import crudRoutes from './routes/crud.js';
import rechargeRoutes from './routes/recharge.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(cors({
  origin: "https://aishwary-crud-api.netlify.app",
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,       // ensures cookie is only sent over HTTPS
    sameSite: 'none',   // allows cross-site cookie (important for Render <-> Vercel)
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/crud', crudRoutes);
app.use('/api/credits', rechargeRoutes);

app.get('/', (req, res) => res.send('CRUD Platform Backend Running'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
