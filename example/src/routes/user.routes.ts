import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes in this file are protected by the auth middleware
router.use(authMiddleware);

// GET /api/users/me - Get the authenticated user's profile
router.get('/me', async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;

  try {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Exclude password from the response
    const { password, ...userData } = user.data;
    res.json({ user: { id: user.id, ...userData } });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile.', error });
  }
});

// GET /api/users/:id - Get a specific user's profile
router.get('/:id', async (req: Request, res: Response) => {
    try {
      const user = await UserModel.findOne({ _id: req.params.id });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
       // Exclude password from the response
      const { password, ...userData } = user.data;
      res.json({ user: { id: user.id, ...userData } });
    } catch (error) {
      res.status(500).json({ message: 'Server error fetching user profile.', error });
    }
  });

export const userRoutes = router;