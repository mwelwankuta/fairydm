import { model, Schema } from 'fairydm';

// 1. Define the Invitation Interface
export interface Invitation {
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// 2. Define the Invitation Schema

export const invitationSchema = new Schema<Invitation>({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  createdAt: { type: String, default: new Date().toISOString() },
});

// 3. Create and export the Invitation model
export const InvitationModel = model<Invitation>('Invitation', invitationSchema);
