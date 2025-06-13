/*
 * This is the main entry point for the social media example app.
 *
 * To run this Express app:
 * 1. Navigate to the `social-media-api-example` directory.
 * 2. Install dependencies: `npm install`
 * 3. Make sure the Firestore emulator is running.
 * 4. Run the app: `npm start`
 */

import express from 'express';
import { connect, disconnect } from 'fairydm';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { invitationRoutes } from './routes/invitation.routes';

const app = express();
const port = process.env.PORT || 3000;

async function startServer() {
  // Connect to Firestore
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  await connect({ projectId: 'social-app-project' });
  console.log('Connected to Firestore emulator.');

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/invitations', invitationRoutes);
  
  app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Welcome to the Social Media API!');
  });

  app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await disconnect();
    console.log('\nDisconnected from Firestore.');
    process.exit(0);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 