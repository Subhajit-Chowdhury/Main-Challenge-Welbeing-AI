/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from './auth-db';
import { WellnessLog } from '../types';

class WellnessDatabase {
  private localKeyPrefix = 'cleanapp_wellness_logs';

  private getStorageKey(userId: string): string {
    return `${this.localKeyPrefix}_${userId}`;
  }

  /**
   * Generates sample history for the past 7 days to seed the dashboard immediately
   */
  private generateSampleHistory(userId: string): WellnessLog[] {
    const moods: WellnessLog['mood'][] = ['Good', 'Excellent', 'Okay', 'Good', 'Excellent', 'Okay', 'Good'];
    const stressLevels = [4, 3, 6, 4, 2, 5, 3];
    const sleepHours = [7.5, 8, 6, 7, 8.5, 6.5, 7.5];
    const studyHours = [4, 6, 8, 5, 3, 7, 4];
    const energyLevels = [7, 8, 6, 7, 9, 5, 8];
    const journals = [
      "Productive study session today. Focused on software architecture. Sleep was restful.",
      "Finished all assignments ahead of schedule! Feeling very energized and prepared.",
      "High study hours today, which caused a bit of stress. Took breaks to stay healthy.",
      "A balanced day. Managed to fit in some exercise and study database indexing techniques.",
      "Excellent sleep last night. Energy levels were off the charts, completed research proposal.",
      "Sleep was slightly short, but still managed to progress on the PWA service worker.",
      "Today was focused on code reviews and clean coding refactors. Felt positive throughout."
    ];

    const logs: WellnessLog[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const logDate = new Date();
      logDate.setDate(now.getDate() - i);
      const dateString = logDate.toISOString().split('T')[0];

      logs.push({
        id: `log-${userId}-${dateString}`,
        userId,
        date: dateString,
        mood: moods[i % moods.length],
        stressLevel: stressLevels[i % stressLevels.length],
        sleepHours: sleepHours[i % sleepHours.length],
        studyHours: studyHours[i % studyHours.length],
        energyLevel: energyLevels[i % energyLevels.length],
        journal: journals[i % journals.length],
        createdAt: logDate.toISOString()
      });
    }

    return logs;
  }

  /**
   * Retrieve all wellness logs for a user
   */
  async getLogs(userId: string): Promise<WellnessLog[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('wellness_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (!error && data) {
          return data.map(item => ({
            id: item.id,
            userId: item.user_id || item.userId,
            date: item.date,
            mood: item.mood,
            stressLevel: item.stress_level || item.stressLevel,
            sleepHours: item.sleep_hours || item.sleepHours,
            studyHours: item.study_hours || item.studyHours,
            energyLevel: item.energy_level || item.energyLevel,
            journal: item.journal || '',
            createdAt: item.created_at || item.createdAt
          }));
        }
        console.warn('[Supabase] Error getting wellness logs, using local fallback:', error);
      } catch (err) {
        console.error('[Supabase] Exception getting wellness logs:', err);
      }
    }

    // Local Storage Fallback
    const key = this.getStorageKey(userId);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      } else {
        // Seed first-time history so the user has immediate beautiful charts
        const sampleLogs = this.generateSampleHistory(userId);
        localStorage.setItem(key, JSON.stringify(sampleLogs));
        return sampleLogs;
      }
    } catch {
      return this.generateSampleHistory(userId);
    }
  }

  /**
   * Save (insert or update) a wellness log
   */
  async saveLog(userId: string, log: Omit<WellnessLog, 'userId' | 'createdAt'>): Promise<boolean> {
    const fullLog: WellnessLog = {
      ...log,
      userId,
      createdAt: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('wellness_logs')
          .upsert({
            id: fullLog.id,
            user_id: userId,
            date: fullLog.date,
            mood: fullLog.mood,
            stress_level: fullLog.stressLevel,
            sleep_hours: fullLog.sleepHours,
            study_hours: fullLog.studyHours,
            energy_level: fullLog.energyLevel,
            journal: fullLog.journal,
            created_at: fullLog.createdAt
          });

        if (!error) return true;
        console.warn('[Supabase] Upsert log failed, writing locally:', error);
      } catch (err) {
        console.error('[Supabase] Exception upserting log:', err);
      }
    }

    // Local Storage update
    const key = this.getStorageKey(userId);
    try {
      const existingLogs = await this.getLogs(userId);
      const existingIndex = existingLogs.findIndex(l => l.date === log.date);

      if (existingIndex > -1) {
        existingLogs[existingIndex] = {
          ...existingLogs[existingIndex],
          ...fullLog
        };
      } else {
        existingLogs.unshift(fullLog);
      }

      // Sort descending by date
      existingLogs.sort((a, b) => b.date.localeCompare(a.date));

      localStorage.setItem(key, JSON.stringify(existingLogs));
      return true;
    } catch (e) {
      console.error('[Wellness Database] Local write failed:', e);
      return false;
    }
  }

  /**
   * Delete a log
   */
  async deleteLog(userId: string, logId: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('wellness_logs')
          .delete()
          .eq('id', logId);

        if (!error) return true;
        console.warn('[Supabase] Delete log failed, removing locally:', error);
      } catch (err) {
        console.error('[Supabase] Exception deleting log:', err);
      }
    }

    // Local Storage delete
    const key = this.getStorageKey(userId);
    try {
      const existingLogs = await this.getLogs(userId);
      const filtered = existingLogs.filter(l => l.id !== logId);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }
}

export const wellnessDb = new WellnessDatabase();
