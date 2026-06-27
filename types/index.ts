/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Common user and application state models
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface UserProfile {
  email: string;
  name?: string;
  preferences?: AppPreferences;
}

export interface AppSession {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  token: string | null;
}


export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  offlineCaching: boolean;
  notificationsEnabled: boolean;
}

export interface AppState {
  isOnline: boolean;
  lastUpdated: string;
}

export interface WellnessLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: 'Awful' | 'Bad' | 'Okay' | 'Good' | 'Excellent';
  stressLevel: number; // 1 to 10
  sleepHours: number; // 0 to 24
  studyHours: number; // 0 to 24
  energyLevel: number; // 1 to 10
  journal: string;
  createdAt: string;
}
