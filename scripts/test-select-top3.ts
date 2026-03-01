import 'dotenv/config';
import { selectTop3 } from '@/features/agents/selection/selectTop3';

const mockCandidates = [
  { agentId: 'tp-001', name: "Joe's Plumbing", score: 0.92, relevance: 0.95, successCount: 150, rating: 4.8, basePrice: 200, yearsExperience: 15 },
  { agentId: 'tp-002', name: 'Quick Fix Plumbing', score: 0.88, relevance: 0.90, successCount: 45, rating: 4.5, basePrice: 150, yearsExperience: 5 },
  { agentId: 'tp-003', name: 'Premium Plumbing Co', score: 0.95, relevance: 0.98, successCount: 300, rating: 4.9, basePrice: 350, yearsExperience: 25 },
  { agentId: 'tp-004', name: 'Budget Plumbers', score: 0.75, relevance: 0.80, successCount: 20, rating: 4.2, basePrice: 100, yearsExperience: 2 },
  { agentId: 'tp-005', name: 'Reliable Rooter', score: 0.85, relevance: 0.88, successCount: 80, rating: 4.6, basePrice: 180, yearsExperience: 10 },
  { agentId: 'tp-006', name: 'City Wide Services', score: 0.82, relevance: 0.85, successCount: 60, rating: 4.4, basePrice: 220, yearsExperience: 8 },
  { agentId: 'tp-007', name: 'Master Plumbers Inc', score: 0.91, relevance: 0.93, successCount: 180, rating: 4.7, basePrice: 280, yearsExperience: 20 },
  { agentId: 'tp-008', name: 'Value Plumbing', score: 0.78, relevance: 0.82, successCount: 35, rating: 4.3, basePrice: 130, yearsExperience: 6 },
  { agentId: 'tp-009', name: 'Expert Electric', score: 0.86, relevance: 0.89, successCount: 90, rating: 4.6, basePrice: 200, yearsExperience: 12 },
  { agentId: 'tp-010', name: 'A+ Home Services', score: 0.83, relevance: 0.87, successCount: 55, rating: 4.5, basePrice: 190, yearsExperience: 9 },
];

const preferences = {
  budget: 200,
  priority: 'cost' as const,
  minRating: 4.0,
};

const scope = {
  jobType: 'Plumbing',
  description: 'Fix leaky faucet in kitchen',
  urgency: 'flexible' as const,
};

async function test() {
  const provider = process.env.LLM_PROVIDER || 'openai';
  console.log(`Testing selectTop3 with ${provider}...\n`);
  
  const result = await selectTop3(mockCandidates, preferences, scope, {
    providerType: provider as 'openai' | 'openrouter' | 'mock',
  });
  
  console.log('=== Result ===');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
