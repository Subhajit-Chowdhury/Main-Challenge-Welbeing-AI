/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Interface defining the behavior of any agent in our clean architecture system
export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    modelUsed: string;
    processingTimeMs: number;
  };
}

export interface BaseAgent {
  agentName: string;
  version: string;
  run(prompt: string, context?: unknown): Promise<AgentResponse<string>>;
}
