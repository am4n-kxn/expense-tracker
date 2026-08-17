import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/google — body: { credential } (the Google ID token from the Sign In With Google button)
export async function googleSignIn(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture || '',
      });
      isNewUser = true;
    }

    if (isNewUser) {
      await Category.insertMany(
        DEFAULT_CATEGORIES.map((name) => ({ name, user: user._id }))
      );
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, picture: user.picture },
    });
  } catch (err) {
    res.status(401).json({ error: 'Google sign-in failed' });
  }
}

// GET /api/auth/me — requires requireAuth middleware to have run first
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user._id, name: user.name, email: user.email, picture: user.picture });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
