import { Schema, model, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{ 
    type: String, 
    required: true 
  }],
  lastMessage: { 
    type: String, 
    required: true 
  },
  lastMessageTime: { 
    type: Date, 
    default: Date.now 
  },
  unreadCount: { 
    type: Map, 
    of: Number,
    default: new Map() 
  }
}, {
  timestamps: true
});

// Índice para garantir que as conversas sejam únicas por par de participantes
conversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation = model<IConversation>('Conversation', conversationSchema);