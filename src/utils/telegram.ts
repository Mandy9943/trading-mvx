import TelegramBot from "node-telegram-bot-api";
import config from "../config";

export const bot = new TelegramBot(config.telegramBot, {
  polling: true,
});
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
});

export const sendMessage = async (message: string) => {
  const chatsIds = config.telegramChatIds;

  for (const chatId of chatsIds) {
    try {
      await bot.sendMessage(chatId, message);
    } catch (error) {
      console.error(`Error al enviar mensaje "${message}" al chat ${chatId}:`);
      // Aquí puedes decidir si quieres continuar con el siguiente ID o detener el proceso.
    }
  }
};
