import express from 'express';
import passport from 'passport';
import '../config/passport.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: true,
  }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`); 
  }
);

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const { id, name, email, apiKey, apiUrl, credits, recharged } = req.user;
    console.log("req -> ", req.user);
    res.json({ id, name, email, apiKey, apiUrl, credits, recharged });
  } else {
    console.log("❌ Unauthorized access attempt:");
    console.log("Cookies:", req.cookies);
    console.log("Session:", req.session);
    console.log("Headers:", req.headers);
    console.log("User (should be null):", req.user);
    
    res.status(401).json({
      message: 'Unauthorized',
      reason: 'User not authenticated. Possibly due to missing or invalid session.',
    });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: 'Logged out' })
  })
})


export default router;
