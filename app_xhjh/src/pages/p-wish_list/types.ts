

export interface Wish {
  id: string;
  name: string;
  description: string;
  requiredEnergy: number;
  currentEnergy: number;
  status: 'pending' | 'approved' | 'achieved' | 'rejected';
  statusText: string;
  createdAt: string;
  canApply: boolean;
}

export type SortOption = 'created_desc' | 'created_asc' | 'energy_desc' | 'energy_asc';

