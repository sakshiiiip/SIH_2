import { WorkerVerificationStatus } from '../types';

export interface WorkerAuthAccount {
  workerId: string;
  name: string;
  email: string;
  phone: string;
  role: 'worker';
  skills: string[];
  experience?: string;
  verificationStatus: WorkerVerificationStatus;
  societyId: string;
  societyName: string;
  federationId?: string;
  firstLogin: boolean; // True if worker must set a new password
  passwordHash: string; // Hashed password (never stored in plain text)
  tempPasswordPlain?: string; // Visible only on Manager Credential Desk for issuance
  avatar?: string;
  createdAt: string;
}

export interface WorkerSession {
  token: string;
  workerId: string;
  name: string;
  email: string;
  role: 'worker';
  societyId: string;
  societyName: string;
  skills: string[];
  avatar?: string;
  rememberMe: boolean;
  expiresAt: number;
}

const STORAGE_ACCOUNTS_KEY = 'coop_worker_auth_vault_v1';
const STORAGE_SESSION_KEY = 'coop_worker_active_session_v1';

// Clean deterministic hashing helper (avoids raw password storage)
export const hashPassword = (pwd: string): string => {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_sec_${Math.abs(hash).toString(16)}_${pwd.length}`;
};

// Default Initial Worker Accounts
const INITIAL_WORKER_ACCOUNTS: WorkerAuthAccount[] = [
  {
    workerId: 'WRK001',
    name: 'Rahul Sharma',
    email: 'worker@example.com',
    phone: '+91 97112 88402',
    role: 'worker',
    skills: ['Plumbing', 'Pipe Repair', 'Drainage'],
    experience: '6 years',
    verificationStatus: 'VERIFIED',
    societyId: 'soc_gr',
    societyName: 'Green Residency',
    federationId: 'fed_mcf',
    firstLogin: true, // Temporary password requires change
    passwordHash: hashPassword('temp123'),
    tempPasswordPlain: 'temp123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15',
  },
  {
    workerId: 'WRK002',
    name: 'Priya Patel',
    email: 'priya.p@coop.org',
    phone: '+91 98202 33419',
    role: 'worker',
    skills: ['Electrical', 'Wiring', 'Switchboard Repair'],
    experience: '4 years',
    verificationStatus: 'VERIFIED',
    societyId: 'soc_gr',
    societyName: 'Green Residency',
    federationId: 'fed_mcf',
    firstLogin: false, // Already completed first-time setup
    passwordHash: hashPassword('worker123'),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01',
  },
  {
    workerId: 'WRK003',
    name: 'Amit Kumar',
    email: 'amit.k@coop.org',
    phone: '+91 98224 55190',
    role: 'worker',
    skills: ['Carpentry', 'Furniture Repair', 'Door Lock Installation'],
    experience: '8 years',
    verificationStatus: 'PENDING',
    societyId: 'soc_gr',
    societyName: 'Green Residency',
    federationId: 'fed_mcf',
    firstLogin: true,
    passwordHash: hashPassword('temp123'),
    tempPasswordPlain: 'temp123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-03-10',
  },
];

class WorkerAuthService {
  private getVault(): WorkerAuthAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse worker auth vault:', e);
    }
    // Seed initial vault
    this.saveVault(INITIAL_WORKER_ACCOUNTS);
    return INITIAL_WORKER_ACCOUNTS;
  }

  private saveVault(accounts: WorkerAuthAccount[]): void {
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save worker auth vault:', e);
    }
  }

  // Get all registered worker accounts (for Society Manager credential view)
  public getRegisteredWorkers(societyId?: string): WorkerAuthAccount[] {
    const vault = this.getVault();
    if (societyId) {
      return vault.filter((w) => w.societyId === societyId);
    }
    return vault;
  }

  // Lookup account by email or worker ID
  public findAccount(identifier: string): WorkerAuthAccount | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const vault = this.getVault();
    return vault.find(
      (a) =>
        a.workerId.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId ||
        a.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '')
    );
  }

  // Authenticate worker with identifier and password
  public authenticate(
    identifier: string,
    passwordAttempt: string
  ): {
    success: boolean;
    account?: WorkerAuthAccount;
    isFirstLogin?: boolean;
    error?: string;
  } {
    const account = this.findAccount(identifier);
    if (!account) {
      return {
        success: false,
        error: 'No worker account found with this Email or Worker ID.',
      };
    }

    const hashedAttempt = hashPassword(passwordAttempt);
    const isRegularMatch = account.passwordHash === hashedAttempt;
    const isTempMatch =
      account.tempPasswordPlain &&
      (account.tempPasswordPlain === passwordAttempt ||
        hashPassword(account.tempPasswordPlain) === hashedAttempt);

    if (!isRegularMatch && !isTempMatch) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials or contact your Society Manager.',
      };
    }

    return {
      success: true,
      account,
      isFirstLogin: account.firstLogin || Boolean(isTempMatch && account.firstLogin),
    };
  }

  // First-time password update
  public completeFirstTimePassword(
    workerId: string,
    tempPasswordAttempt: string,
    newPassword: string
  ): { success: boolean; account?: WorkerAuthAccount; error?: string } {
    const vault = this.getVault();
    const index = vault.findIndex((a) => a.workerId.toLowerCase() === workerId.toLowerCase());

    if (index === -1) {
      return { success: false, error: 'Worker account not found.' };
    }

    const account = vault[index];
    const hashedAttempt = hashPassword(tempPasswordAttempt);
    const isTempMatch =
      (account.tempPasswordPlain && account.tempPasswordPlain === tempPasswordAttempt) ||
      account.passwordHash === hashedAttempt;

    if (!isTempMatch) {
      return { success: false, error: 'Temporary password does not match.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    if (newPassword === tempPasswordAttempt) {
      return { success: false, error: 'New password must be different from temporary password.' };
    }

    // Update account
    const updatedAccount: WorkerAuthAccount = {
      ...account,
      firstLogin: false,
      passwordHash: hashPassword(newPassword),
      tempPasswordPlain: undefined, // Clear temporary password once changed
    };

    vault[index] = updatedAccount;
    this.saveVault(vault);

    return { success: true, account: updatedAccount };
  }

  // Request password reset (clean mock recovery flow)
  public requestPasswordReset(
    identifier: string
  ): { success: boolean; maskedContact?: string; error?: string } {
    const account = this.findAccount(identifier);
    if (!account) {
      return { success: false, error: 'Account not found with this identifier.' };
    }

    // Masked email for security
    const parts = account.email.split('@');
    const masked =
      parts[0].length > 2
        ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
        : `${parts[0]}***@${parts[1]}`;

    return { success: true, maskedContact: masked };
  }

  // Reset password
  public resetPassword(
    identifier: string,
    newPassword: string
  ): { success: boolean; account?: WorkerAuthAccount; error?: string } {
    const vault = this.getVault();
    const index = vault.findIndex(
      (a) =>
        a.workerId.toLowerCase() === identifier.trim().toLowerCase() ||
        a.email.toLowerCase() === identifier.trim().toLowerCase()
    );

    if (index === -1) {
      return { success: false, error: 'Account not found.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    vault[index].passwordHash = hashPassword(newPassword);
    vault[index].firstLogin = false;
    vault[index].tempPasswordPlain = undefined;
    this.saveVault(vault);

    return { success: true, account: vault[index] };
  }

  // Society Manager creates worker account
  public createWorkerByManager(data: {
    name: string;
    email: string;
    phone: string;
    workerId: string;
    skills: string[];
    experience?: string;
    societyId: string;
    societyName: string;
    temporaryPassword: string;
    avatar?: string;
  }): { success: boolean; account?: WorkerAuthAccount; error?: string } {
    const vault = this.getVault();

    // Check duplicate
    const existing = vault.find(
      (a) =>
        a.workerId.toLowerCase() === data.workerId.trim().toLowerCase() ||
        a.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        error: `Worker with ID ${data.workerId} or Email ${data.email} already exists.`,
      };
    }

    const newAccount: WorkerAuthAccount = {
      workerId: data.workerId.trim().toUpperCase(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      role: 'worker',
      skills: data.skills.length > 0 ? data.skills : ['General Maintenance'],
      experience: data.experience || '1-3 years',
      verificationStatus: 'PENDING',
      societyId: data.societyId,
      societyName: data.societyName,
      firstLogin: true, // Temporary password requires first-time update
      passwordHash: hashPassword(data.temporaryPassword),
      tempPasswordPlain: data.temporaryPassword, // Available on Manager desk for issuance
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };

    vault.push(newAccount);
    this.saveVault(vault);

    return { success: true, account: newAccount };
  }

  // Session Management (Never stores raw passwords in localStorage or sessionStorage)
  public saveSession(account: WorkerAuthAccount, rememberMe: boolean): WorkerSession {
    const session: WorkerSession = {
      token: `wrk_sess_${account.workerId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      workerId: account.workerId,
      name: account.name,
      email: account.email,
      role: 'worker',
      societyId: account.societyId,
      societyName: account.societyName,
      skills: account.skills,
      avatar: account.avatar,
      rememberMe,
      expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000), // 30 days vs 8 hours
    };

    try {
      if (rememberMe) {
        // Persistent across browser restarts
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
      } else {
        // Ephemeral session: clears when browser/tab is closed
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Failed to save worker session:', e);
    }

    return session;
  }

  public getActiveSession(): WorkerSession | null {
    try {
      // Check session storage first (current active tab)
      const sessionStr = sessionStorage.getItem(STORAGE_SESSION_KEY);
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed.expiresAt > Date.now()) return parsed;
      }

      // Check local storage (remember me)
      const localStr = localStorage.getItem(STORAGE_SESSION_KEY);
      if (localStr) {
        const parsed = JSON.parse(localStr);
        if (parsed.expiresAt > Date.now()) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read worker session:', e);
    }
    return null;
  }

  public clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to clear worker session:', e);
    }
  }
}

export const workerAuthService = new WorkerAuthService();
