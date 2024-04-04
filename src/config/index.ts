import dotenv from "dotenv";

dotenv.config();

interface Config {
  telegramBot: string;
  walletFilePassword: string;

  buyPercent: number;
  loopSeconds: number;
  maxProfit: number /* For example *10 or *5  */;
  timeToCheckMaxProfit: number;
  timeForFirstSell: number /* In seconds */;
  timeForSecondSell: number;
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

    buyPercent: 100,
    loopSeconds: 5000 /* 10 seconds */,
    maxProfit: 10 /* x10 */,
    timeToCheckMaxProfit: 1000 * 2 /* 2 seconds */,
    timeForFirstSell: 1000 * 60 /* 1 minute */,
    timeForSecondSell: 1000 * 60 * 3 /* 3 minutes */,
    minLiquidityLockedUSD: 800 /*  usd  */,
    telegramChatIds: [709820730],
  };
}

const config = loadConfig();

export default config;
