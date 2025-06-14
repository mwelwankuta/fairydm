import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'Name, email, password, and phoneNumber are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    
    // Hash password before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        zip: "12345",
        country: {
          name: "United States",
          code: "US"
        }
      }
    });

    // Don't send password back
    const userResponse = { id: user.id, firstName: user.data.firstName, lastName: user.data.lastName, email: user.data.email, phoneNumber: user.data.phoneNumber };

    res.status(201).json({ message: 'User registered successfully', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.data.password!);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
});

export const authRoutes = router; 