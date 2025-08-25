import { Stats, Item, Request, Movement, Professor } from '../types';
import { Book, Laptop, Calculator, Music } from 'lucide-react';

export const stats: Stats = {
  totalItems: 1247,
  activeProfessors: 42,
  pendingRequests: 15,
  todayMovements: 45
};

export const inventory: Item[] = [
  { id: 1, name: 'Livros Didáticos', total: 450, available: 423, borrowed: 27, category: 'Educacional' },
  { id: 2, name: 'Tablets Educacionais', total: 80, available: 72, borrowed: 8, category: 'Tecnologia' },
  { id: 3, name: 'Calculadoras', total: 120, available: 98, borrowed: 22, category: 'Material' },
  { id: 4, name: 'Instrumentos Musicais', total: 35, available: 28, borrowed: 7, category: 'Arte' }
];

export const requests: Request[] = [
  {
    id: 1,
    professor: 'Prof. Ana Silva',
    subject: 'Matemática',
    item: 'Calculadoras Científicas',
    quantity: 15,
    requestDate: '2025-08-25',
    priority: 'alta',
    status: 'pendente',
    description: 'Para aula prática de estatística'
  },
  {
    id: 2,
    professor: 'Prof. João Santos',
    subject: 'História',
    item: 'Livros Didáticos',
    quantity: 8,
    requestDate: '2025-08-24',
    priority: 'média',
    status: 'aprovado',
    description: 'Material para pesquisa sobre Brasil Colonial'
  },
  {
    id: 3,
    professor: 'Prof. Maria Costa',
    subject: 'Ciências',
    item: 'Microscópios',
    quantity: 5,
    requestDate: '2025-08-25',
    priority: 'alta',
    status: 'em_analise',
    description: 'Experimento de células vegetais'
  },
  {
    id: 4,
    professor: 'Prof. Pedro Lima',
    subject: 'Arte',
    item: 'Instrumentos Musicais',
    quantity: 3,
    requestDate: '2025-08-23',
    priority: 'baixa',
    status: 'rejeitado',
    description: 'Aula de música - violões'
  }
];

export const movements: Movement[] = [
  {
    id: 1,
    professor: 'Prof. Ana Silva',
    item: 'Livro de Matemática',
    type: 'empréstimo',
    date: '2025-08-25',
    status: 'ativo'
  },
  {
    id: 2,
    professor: 'Prof. João Santos',
    item: 'Tablet Educacional',
    type: 'empréstimo',
    date: '2025-08-24',
    status: 'pendente'
  },
  {
    id: 3,
    professor: 'Prof. Maria Costa',
    item: 'Calculadora Científica',
    type: 'devolução',
    date: '2025-08-25',
    status: 'concluído'
  },
  {
    id: 4,
    professor: 'Prof. Pedro Lima',
    item: 'Livro de História',
    type: 'empréstimo',
    date: '2025-08-23',
    status: 'atrasado'
  }
];

export const professors: Professor[] = [
  {
    id: 1,
    name: 'Prof. Ana Silva',
    subject: 'Matemática',
    activeRequests: 2,
    totalRequests: 8,
    lastRequest: '2025-08-25',
    status: 'ativo'
  },
  {
    id: 2,
    name: 'Prof. João Santos',
    subject: 'História',
    activeRequests: 1,
    totalRequests: 5,
    lastRequest: '2025-08-24',
    status: 'ativo'
  },
  {
    id: 3,
    name: 'Prof. Maria Costa',
    subject: 'Ciências',
    activeRequests: 0,
    totalRequests: 12,
    lastRequest: '2025-08-25',
    status: 'ativo'
  },
  {
    id: 4,
    name: 'Prof. Pedro Lima',
    subject: 'Arte',
    activeRequests: 3,
    totalRequests: 6,
    lastRequest: '2025-08-20',
    status: 'pendente'
  }
];