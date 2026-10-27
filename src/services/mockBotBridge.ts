import { BotConfig, BotLog, BotStatus } from '../types/bot';

// Mock in-memory bot storage
const bots: Map<string, BotConfig> = new Map();
const logs: Map<string, BotLog[]> = new Map();
const statuses: Map<string, BotStatus> = new Map();

export const mockBotBridge = {
  createBot: async (config: BotConfig): Promise<BotConfig> => {
    bots.set(config.id, config);
    logs.set(config.id, [{ timestamp: new Date().toLocaleTimeString(), message: `Bot ${config.name} created.`, type: 'info' }]);
    statuses.set(config.id, { botId: config.id, isActive: false, lastTrade: null, totalPnL: 0 });
    return config;
  },

  startBot: async (id: string): Promise<void> => {
    const bot = bots.get(id);
    if (bot) {
      bot.isActive = true;
      const status = statuses.get(id);
      if (status) status.isActive = true;
      logs.get(id)?.push({ timestamp: new Date().toLocaleTimeString(), message: 'Bot started.', type: 'info' });
    }
  },

  stopBot: async (id: string): Promise<void> => {
    const bot = bots.get(id);
    if (bot) {
      bot.isActive = false;
      const status = statuses.get(id);
      if (status) status.isActive = false;
      logs.get(id)?.push({ timestamp: new Date().toLocaleTimeString(), message: 'Bot stopped.', type: 'info' });
    }
  },

  getBots: async (): Promise<BotConfig[]> => Array.from(bots.values()),
  
  getLogs: async (id: string): Promise<BotLog[]> => logs.get(id) || [],

  getStatus: async (id: string): Promise<BotStatus | null> => statuses.get(id) || null
};
