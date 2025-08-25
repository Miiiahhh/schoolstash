import { ProfessorAccount } from '../types';

export const ADMIN_PASSWORD = 'admin2025';

export const PROFESSOR_ACCOUNTS: Record<string, ProfessorAccount> = {
  'prof.ana': { name: 'Prof. Ana Silva', subject: 'Matemática', password: 'ana123' },
  'prof.joao': { name: 'Prof. João Santos', subject: 'História', password: 'joao123' },
  'prof.maria': { name: 'Prof. Maria Costa', subject: 'Ciências', password: 'maria123' },
  'prof.pedro': { name: 'Prof. Pedro Lima', subject: 'Arte', password: 'pedro123' }
};