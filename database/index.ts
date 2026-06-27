/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Interface contracts representing a generic database repository pattern
export interface DatabaseRepository<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class LocalStorageRepository<T extends { id: string }> implements DatabaseRepository<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  private getData(): T[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveData(data: T[]) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async getById(id: string): Promise<T | null> {
    const data = this.getData();
    return data.find(item => item.id === id) || null;
  }

  async getAll(): Promise<T[]> {
    return this.getData();
  }

  async create(item: T): Promise<T> {
    const data = this.getData();
    data.push(item);
    this.saveData(data);
    return item;
  }

  async update(id: string, item: Partial<T>): Promise<boolean> {
    const data = this.getData();
    const index = data.findIndex(x => x.id === id);
    if (index === -1) return false;
    data[index] = { ...data[index], ...item };
    this.saveData(data);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const data = this.getData();
    const filtered = data.filter(x => x.id !== id);
    if (filtered.length === data.length) return false;
    this.saveData(filtered);
    return true;
  }
}
