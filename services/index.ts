/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Base class representing standard clean-architecture services
export abstract class BaseService {
  protected abstract serviceName: string;

  protected log(message: string, type: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    console[type](`[${timestamp}] [Service: ${this.serviceName}] ${message}`);
  }
}
