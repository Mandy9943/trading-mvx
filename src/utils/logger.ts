import { createLogger, format, transports } from "winston";

// Crea el logger
const logger = createLogger({
  // Nivel de log; solo los logs de nivel igual o superior se registrarán
  level: "info",
  // Formato de los logs
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }), // Para mostrar la pila de errores
    format.splat(),
    format.json()
  ),
  // Dónde se deben guardar/generar los logs
  transports: [
    // Configuración para la consola
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    // Configuración para archivo de logs
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
