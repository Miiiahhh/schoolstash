import { sha256Hex } from "@/lib/crypto";

type ProfessorRecord = {
  username: string;
  name: string;
  subject: string;
  passwordHash: string;
};

type AuthConfig = {
  adminPasswordHash: string;
  professors: ProfessorRecord[];
};

const LS_KEY = "schoolstash_auth_v1";

// Seeds iniciais (somente 1ª execução)
const SEED = {
  adminPassword: "admin2025",
  professors: [
    { username: "prof.ana",   name: "Prof. Ana Silva",   subject: "Matemática", password: "ana123" },
    { username: "prof.joao",  name: "Prof. João Santos", subject: "História",   password: "joao123" },
    { username: "prof.maria", name: "Prof. Maria Costa", subject: "Ciências",   password: "maria123" },
    { username: "prof.pedro", name: "Prof. Pedro Lima",  subject: "Arte",       password: "pedro123" },
  ]
};

function readConfig(): AuthConfig | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthConfig;
  } catch { return null; }
}

function writeConfig(cfg: AuthConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

export function ensureAuthConfig(): AuthConfig {
  const current = readConfig();
  if (current) return current;

  const adminPasswordHash = sha256Hex(SEED.adminPassword);
  const professors: ProfessorRecord[] = SEED.professors.map(p => ({
    username: p.username,
    name: p.name,
    subject: p.subject,
    passwordHash: sha256Hex(p.password),
  }));

  const cfg: AuthConfig = { adminPasswordHash, professors };
  writeConfig(cfg);
  return cfg;
}

export function verifyAdminPassword(plain: string): boolean {
  const cfg = ensureAuthConfig();
  return sha256Hex(plain) === cfg.adminPasswordHash;
}

export function setAdminPassword(newPlain: string): void {
  const cfg = ensureAuthConfig();
  cfg.adminPasswordHash = sha256Hex(newPlain);
  writeConfig(cfg);
}

export function listProfessors(): ProfessorRecord[] {
  const cfg = ensureAuthConfig();
  return cfg.professors.slice().sort((a,b)=>a.username.localeCompare(b.username));
}

export function findProfessor(username: string): ProfessorRecord | undefined {
  const cfg = ensureAuthConfig();
  return cfg.professors.find(p => p.username === username);
}

export function upsertProfessor(rec: Omit<ProfessorRecord,"passwordHash"> & { password?: string }): void {
  const cfg = ensureAuthConfig();
  const idx = cfg.professors.findIndex(p => p.username === rec.username);
  const passwordHash = rec.password ? sha256Hex(rec.password) : (idx >= 0 ? cfg.professors[idx].passwordHash : sha256Hex("123456"));

  const next: ProfessorRecord = {
    username: rec.username.trim(),
    name: rec.name.trim(),
    subject: rec.subject.trim(),
    passwordHash
  };

  if (idx >= 0) cfg.professors[idx] = next;
  else cfg.professors.push(next);

  writeConfig(cfg);
}

export function removeProfessor(username: string): void {
  const cfg = ensureAuthConfig();
  cfg.professors = cfg.professors.filter(p => p.username !== username);
  writeConfig(cfg);
}

export function verifyProfessor(username: string, plain: string): ProfessorRecord | null {
  const p = findProfessor(username);
  if (!p) return null;
  const ok = sha256Hex(plain) === p.passwordHash;
  return ok ? p : null;
}
