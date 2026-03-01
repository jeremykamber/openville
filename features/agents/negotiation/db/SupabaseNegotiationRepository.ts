import { supabaseAdmin } from '@/lib/supabase/server';
import { Negotiation, NegotiationMessage, NegotiationResult, NegotiationStatus, NegotiationTurn } from '../types';
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
      .maybeSingle();

    if (error) {
      console.error(`Error fetching negotiation ${id}:`, error);
      return null;
    }
    return data ? this.mapDbToNegotiation(data) : null;
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
    return (data || []).map((row) => this.mapDbToMessage(row));
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

  private mapDbToNegotiation(row: Record<string, unknown>): Negotiation {
    return {
      id: row.id as string,
      buyerAgentId: row.buyer_agent_id as string,
      providerAgentId: row.provider_agent_id as string,
      jobId: row.job_id as string | undefined,
      status: row.status as NegotiationStatus,
      currentTurn: row.current_turn as NegotiationTurn,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      endedAt: row.ended_at ? new Date(row.ended_at as string) : undefined,
      summary: row.summary as string | undefined,
    };
  }

  private mapDbToMessage(row: Record<string, unknown>): NegotiationMessage {
    return {
      id: row.id as string,
      negotiationId: row.negotiation_id as string,
      sender: row.sender as string,
      senderType: row.sender_type as 'buyer' | 'provider',
      content: row.content as string,
      messageType: row.message_type as 'message' | 'proposal' | 'cancellation',
      createdAt: new Date(row.created_at as string),
    };
  }

  private mapDbToResult(row: Record<string, unknown>): NegotiationResult {
    return {
      id: row.id as string,
      negotiationId: row.negotiation_id as string,
      proposedBy: row.proposed_by as string,
      status: row.status as 'pending' | 'accepted' | 'rejected',
      finalPrice: row.final_price as number | undefined,
      scope: row.scope_description ? {
        description: row.scope_description as string,
        rooms: row.scope_rooms as number,
        details: row.scope_details as Record<string, unknown>,
      } : undefined,
      createdAt: new Date(row.created_at as string),
      respondedAt: row.responded_at ? new Date(row.responded_at as string) : undefined,
      responseMessage: row.response_message as string | undefined,
    };
  }
}

export const defaultNegotiationRepository = new SupabaseNegotiationRepository();
