export interface User {
  name: string;
  type: 'admin' | 'professor';
  subject?: string;
  username?: string;
}

export interface ProfessorAccount {
  name: string;
  subject: string;
  password: string;
}

export interface AppState {
  isAuthenticated: boolean;
  userType: 'admin' | 'professor' | '';
  currentUser: User | null;
  password: string;
  isLoading: boolean;
  error: string;
  activeTab: string;
  showModal: boolean;
  modalType: string;
}

export interface Item {
  id: number;
  name: string;
  total: number;
  available: number;
  borrowed: number;
  category: string;
  icon?: string;
}

export interface Request {
  id: number;
  professor: string;
  subject: string;
  item: string;
  quantity: number;
  requestDate: string;
  priority: 'alta' | 'média' | 'baixa';
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'em_analise';
  description: string;
}

export interface Movement {
  id: number;
  professor: string;
  item: string;
  type: 'empréstimo' | 'devolução';
  date: string;
  status: 'ativo' | 'pendente' | 'concluído' | 'atrasado';
}

export interface Professor {
  id: number;
  name: string;
  subject: string;
  activeRequests: number;
  totalRequests: number;
  lastRequest: string;
  status: 'ativo' | 'pendente';
}

export interface Stats {
  totalItems: number;
  activeProfessors: number;
  pendingRequests: number;
  todayMovements: number;
}

export type AppAction =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER_TYPE'; payload: 'admin' | 'professor' | '' }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SHOW_MODAL'; payload: boolean }
  | { type: 'SET_MODAL_TYPE'; payload: string }
  | { type: 'RESET_STATE' };
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  minQty: number;
  updatedAt: string; // ISO
}

export interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out";
  amount: number;
  user: string;
  date: string; // ISO
  note?: string;
}

export interface RequestItem {
  id: string;
  itemName: string;
  amount: number;
}

export interface Request {
  id: string;
  requester: string; // professor
  items: RequestItem[];
  status: "pending" | "approved" | "denied";
  createdAt: string; // ISO
  note?: string;
}
