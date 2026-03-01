import { supabaseAdmin } from '@/lib/supabase/server';
import { Negotiation, NegotiationMessage, NegotiationResult } from '../types';
import { NegotiationRepository } from './NegotiationRepository';

export class SupabaseNegotiationRepository implements NegotiationRepository {
  async createNegotiation(
    buyerAgentId: string,
    providerAgentId: string,
    jobId?: string
  ): Promise<Negotiation> {
    const { data, error } = await supabaseAdmin
      .from('negotiations')
      .insert({
        buyer_agent_id: buyerAgentId,
        provider_agent_id: providerAgentId,
        job_id: jobId,
        status: 'active',
        current_turn: 'buyer',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create negotiation: ${error.message}`);
    return this.mapDbToNegotiation(data);
  }

  async getNegotiation(id: string): Promise<Negotiation | null> {
    const { data, error } = await supabaseAdmin
      .from('negotiations')
      .select()
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapDbToNegotiation(data);
  }

  async addMessage(
    negotiationId: string,
    sender: string,
    senderType: 'buyer' | 'provider',
    content: string,
    messageType: 'message' | 'proposal' | 'cancellation' = 'message'
  ): Promise<NegotiationMessage> {
    const { data, error } = await supabaseAdmin
      .from('negotiation_messages')
      .insert({
        negotiation_id: negotiationId,
        sender,
        sender_type: senderType,
        content,
        message_type: messageType,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add message: ${error.message}`);
    return this.mapDbToMessage(data);
  }

  async getMessages(negotiationId: string): Promise<NegotiationMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('negotiation_messages')
      .select()
      .eq('negotiation_id', negotiationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    return data.map((row: any) => this.mapDbToMessage(row));
  }

  async updateNegotiationStatus(
    id: string,
    status: 'active' | 'completed' | 'cancelled',
    summary?: string
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('negotiations')
      .update({
        status,
        summary,
        ended_at: status !== 'active' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to update negotiation: ${error.message}`);
  }

  async createNegotiationResult(
    negotiationId: string,
    proposedBy: string,
    finalPrice?: number,
    scope?: { description?: string; rooms?: number; details?: Record<string, unknown> }
  ): Promise<NegotiationResult> {
    const { data, error } = await supabaseAdmin
      .from('negotiation_results')
      .insert({
        negotiation_id: negotiationId,
        proposed_by: proposedBy,
        status: 'pending',
        final_price: finalPrice,
        scope_description: scope?.description,
        scope_rooms: scope?.rooms,
        scope_details: scope?.details,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create result: ${error.message}`);
    return this.mapDbToResult(data);
  }

  async respondToResult(
    resultId: string,
    status: 'accepted' | 'rejected',
    responseMessage?: string
  ): Promise<NegotiationResult> {
    const { data, error } = await supabaseAdmin
      .from('negotiation_results')
      .update({
        status,
        response_message: responseMessage,
        responded_at: new Date().toISOString(),
      })
      .eq('id', resultId)
      .select()
      .single();

    if (error) throw new Error(`Failed to respond to result: ${error.message}`);
    return this.mapDbToResult(data);
  }

  private mapDbToNegotiation(row: any): Negotiation {
    return {
      id: row.id,
      buyerAgentId: row.buyer_agent_id,
      providerAgentId: row.provider_agent_id,
      jobId: row.job_id,
      status: row.status,
      currentTurn: row.current_turn,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      summary: row.summary,
    };
  }

  private mapDbToMessage(row: any): NegotiationMessage {
    return {
      id: row.id,
      negotiationId: row.negotiation_id,
      sender: row.sender,
      senderType: row.sender_type,
      content: row.content,
      messageType: row.message_type,
      createdAt: new Date(row.created_at),
    };
  }

  private mapDbToResult(row: any): NegotiationResult {
    return {
      id: row.id,
      negotiationId: row.negotiation_id,
      proposedBy: row.proposed_by,
      status: row.status,
      finalPrice: row.final_price,
      scope: row.scope_description ? {
        description: row.scope_description,
        rooms: row.scope_rooms,
        details: row.scope_details,
      } : undefined,
      createdAt: new Date(row.created_at),
      respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
      responseMessage: row.response_message,
    };
  }
}

export const defaultNegotiationRepository = new SupabaseNegotiationRepository();
