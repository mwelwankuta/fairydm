import { Router, Request, Response } from 'express';
import { InvitationModel } from '../models/Invitation.model';
import { ContactModel } from '../models/Contact.model';
import { NotificationModel } from '../models/Notification.model';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// POST /api/invitations/send - Send a contact request
router.post('/send', async (req: Request, res: Response) => {
  try {
    const senderId = (req as Request & { userId: string }).userId;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
        return res.status(400).json({ message: "You cannot send an invitation to yourself." });
    }

    // Check if an invitation already exists, checking both directions
    const existingInvitation1 = await InvitationModel.findOne({ senderId, receiverId });
    const existingInvitation2 = await InvitationModel.findOne({ senderId: receiverId, receiverId: senderId });

    if (existingInvitation1 || existingInvitation2) {
      return res.status(400).json({ message: 'An invitation already exists between these users.' });
    }

    const invitation = await InvitationModel.create({ senderId, receiverId, status: 'pending', createdAt: new Date() });

    // Create a notification for the receiver
    await NotificationModel.create({
        userId: receiverId,
        message: `You have a new contact request.`,
        link: `/invitations/${invitation.id}`,
        isRead: false,
        createdAt: new Date()
    });

    res.status(201).json({ message: 'Invitation sent.', invitation });
  } catch (error) {
    res.status(500).json({ message: 'Server error sending invitation.', error });
  }
});

// POST /api/invitations/:id/accept - Accept a contact request
router.post('/:id/accept', async (req: Request, res: Response) => {
    try {
      const invitationId = req.params.id;
      const receiverId = (req as Request & { userId: string }).userId;
  
      const invitation = await InvitationModel.findOne({ _id: invitationId, receiverId, status: 'pending' });
  
      if (!invitation) {
        return res.status(404).json({ message: 'Invitation not found or you are not authorized to accept it.' });
      }
  
      invitation.data.status = 'accepted';
      await invitation.save();
  
      // Create a contact for both users
      await ContactModel.create({ userId: invitation.data.senderId, contactId: receiverId, isFavorite: false, createdAt: new Date() });
      await ContactModel.create({ userId: receiverId, contactId: invitation.data.senderId, isFavorite: false, createdAt: new Date() });
  
      // Notify the sender that their request was accepted
      await NotificationModel.create({
        userId: invitation.data.senderId,
        message: 'Your contact request was accepted.',
        isRead: false,
        createdAt: new Date()
      });
  
      res.json({ message: 'Invitation accepted.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error accepting invitation.', error });
    }
  });
  
  // POST /api/invitations/:id/decline - Decline a contact request
  router.post('/:id/decline', async (req: Request, res: Response) => {
    try {
        const invitationId = req.params.id;
        const receiverId = (req as Request & { userId: string }).userId;
    
        const invitation = await InvitationModel.findOne({ _id: invitationId, receiverId, status: 'pending' });
    
        if (!invitation) {
          return res.status(404).json({ message: 'Invitation not found or you are not authorized to decline it.' });
        }
    
        invitation.data.status = 'declined';
        await invitation.save();
    
        res.json({ message: 'Invitation declined.' });
      } catch (error) {
        res.status(500).json({ message: 'Server error declining invitation.', error });
      }
  });

export const invitationRoutes = router; 