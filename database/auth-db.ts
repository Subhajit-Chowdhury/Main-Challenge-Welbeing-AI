import bcrypt from 'bcryptjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../types';

// Read env variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Client initialized successfully.');
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
  }
}

// Default pre-calculated bcrypt hashes for 'demo123' with 10 rounds to avoid slow startup.
// Hashing "demo123" with bcrypt:
// Let's generate it dynamically if needed or define a static one. To be absolutely precise and use
// actual bcrypt, we can generate them on the fly if not found or pre-generate.
const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo123', 10);

const DEMO_USERS: User[] = [
  {
    id: 'user-student1',
    username: 'student1',
    email: 'student1@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-student2',
    username: 'student2',
    email: 'student2@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-student3',
    username: 'student3',
    email: 'student3@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: new Date().toISOString()
  }
];

class AuthDatabase {
  private localUsersKey = 'cleanapp_users_db';

  constructor() {
    this.seedDemoUsers();
  }

  private seedDemoUsers() {
    try {
      const existing = localStorage.getItem(this.localUsersKey);
      if (!existing) {
        localStorage.setItem(this.localUsersKey, JSON.stringify(DEMO_USERS));
        console.log('[Auth Database] Seeded demo users successfully.');
      }
    } catch (e) {
      console.error('[Auth Database] Failed to seed demo users in localStorage:', e);
    }
  }

  private getLocalUsers(): User[] {
    try {
      const data = localStorage.getItem(this.localUsersKey);
      return data ? JSON.parse(data) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  }

  private saveLocalUsers(users: User[]) {
    localStorage.setItem(this.localUsersKey, JSON.stringify(users));
  }

  /**
   * Find a user by username or email.
   * If Supabase is connected, it fetches from the database.
   * Otherwise, it queries local storage.
   */
  async findUser(usernameOrEmail: string): Promise<User | null> {
    const query = usernameOrEmail.trim().toLowerCase();

    if (supabase) {
      try {
        // First try finding by username
        let { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', query)
          .single();

        if (error || !data) {
          // Try by email
          const emailQuery = await supabase
            .from('users')
            .select('*')
            .eq('email', query)
            .single();
          data = emailQuery.data;
        }

        if (data) {
          return {
            id: data.id,
            username: data.username,
            email: data.email,
            passwordHash: data.password_hash || data.passwordHash,
            createdAt: data.created_at || data.createdAt
          };
        }
      } catch (err) {
        console.warn('[Supabase] Error finding user, falling back to local database:', err);
      }
    }

    // Local DB query fallback
    const localUsers = this.getLocalUsers();
    const found = localUsers.find(
      u => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );
    return found || null;
  }

  /**
   * Create a new user (with bcrypt hash)
   */
  async registerUser(username: string, email: string, passwordPlain: string): Promise<User | null> {
    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const newUser: User = {
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            password_hash: newUser.passwordHash,
            created_at: newUser.createdAt
          })
          .select()
          .single();

        if (!error && data) {
          return newUser;
        }
        console.warn('[Supabase] Insert failed, registering locally instead:', error);
      } catch (err) {
        console.error('[Supabase] Error registering user, falling back to local database:', err);
      }
    }

    const localUsers = this.getLocalUsers();
    if (localUsers.some(u => u.username.toLowerCase() === newUser.username.toLowerCase() || u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return null; // Username/email already exists
    }

    localUsers.push(newUser);
    this.saveLocalUsers(localUsers);
    return newUser;
  }
}

export const authDb = new AuthDatabase();
export { supabase };
