import dotenv from "dotenv";

dotenv.config();

interface Config {
  telegramBot: string;
  walletFilePassword: string;

  loopSeconds: number;
  maxProfit: number /* For example *10 or *5  */;
  maxTimeAfterBuy: number /* In seconds */;
  minLiquidityLockedUSD: number /* In usd  */;
  telegramChatIds: number[];
}

function validateEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`La variable de entorno ${name} no está seteada.`);
  }
  return value;
}

function loadConfig(): Config {
  return {
    telegramBot: validateEnvVariable("TEL_BOT_TOKEN"),
    walletFilePassword: validateEnvVariable("WALLET_FILE_PASSWORD"),

    loopSeconds: 10 /* 10 seconds */,
    maxProfit: 10 /* For example *10 or *5  */,
    maxTimeAfterBuy: 30 /* In seconds */,
    minLiquidityLockedUSD: 800 /* In WEGLD  */,
    telegramChatIds: [709820730],
  };
}

const config = loadConfig();

export default config;
