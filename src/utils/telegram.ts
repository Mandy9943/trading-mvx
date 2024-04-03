import TelegramBot from "node-telegram-bot-api";
import config from "../config";

const bot = new TelegramBot(config.telegramBot, {
  polling: true,
});

export const sendMessage = async (message: string) => {
  const chatsIds = config.telegramChatIds;

  for (const chatId of chatsIds) {
    await bot.sendMessage(
      chatId,
      `
        ℹ️ INFO: 
        
        ${message}
        
        `
    );
  }
};
