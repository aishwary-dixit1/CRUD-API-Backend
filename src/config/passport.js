import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/auth/google/callback` : '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.emails[0].value },
      });

      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = await prisma.user.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0].value,
          apiKey: uuidv4(),
          apiUrl: `https://aishwary-api/api/crud/${profile.emails[0].value}`,
        },
      });

      return done(null, newUser);
    }
  )
);
