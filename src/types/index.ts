export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  broker_name: string;
  status: 'pending' | 'approved' | 'rejected';
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  account_id: string;
  user_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  open_price: number;
  close_price: number | null;
  profit: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at: string | null;
}

export interface BotStatus {
  id: string;
  account_id: string;
  user_id: string;
  is_running: boolean;
  balance: number;
  last_24h_pnl: number;
  updated_at: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  account_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'setup'
  | 'support'
  | 'admin'
  | 'risk'
  | 'performance';
