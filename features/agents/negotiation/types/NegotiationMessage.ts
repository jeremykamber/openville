export type SenderType = 'buyer' | 'provider';
export type MessageType = 'message' | 'proposal' | 'cancellation';

export interface NegotiationMessage {
  id: string;
  negotiationId: string;
  sender: string;
  senderType: SenderType;
  content: string;
  messageType: MessageType;
  createdAt: Date;
}
