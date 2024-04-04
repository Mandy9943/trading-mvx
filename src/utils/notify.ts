import logger from "./logger";
import { sendMessage } from "./telegram";

export const info = async (message: string) => {
  logger.info(message);

  await sendMessage(
    `ℹ️ INFO: 
${message}`
  );
};
export const error = async (message: string) => {
  logger.error(message);

  await sendMessage(
    `❌ ERROR: 
 ${message}`
  );
};
