# Bot de Trading para MultiversX

Este bot está diseñado para operar en la blockchain de MultiversX, específicamente en su exchange descentralizado. Su estrategia se centra en monitorear pares de tokens, identificar aquellos que están a punto de activar swaps y ejecutar operaciones de compra y venta basadas en condiciones específicas de precio y tiempo.

## Características

- Monitorea pares de tokens en busca de cambios en su estado de "Partial Active" a "Active".
- Ejecuta compras de tokens recién activados basándose en la configuración de liquidez mínima.
- Vende tokens bajo las siguientes condiciones:
  - Si el precio del token aumenta 10 veces.
  - Si han pasado 1 minuto desde la compra, vende el 70% del token.
  - Si han pasado 5 minutos desde la compra, vende el resto del token.

## Configuración

Antes de ejecutar el bot, asegúrate de configurar las siguientes variables de entorno en tu archivo `.env`:

- `TEL_BOT_TOKEN`: El token de tu bot de Telegram. Se utiliza para enviar notificaciones sobre las operaciones del bot.
- `WALLET_FILE_PASSWORD`: La contraseña de tu archivo de wallet. Se utiliza para autenticar operaciones en la blockchain.

Además, el archivo `config/index.ts` establece las siguientes configuraciones predeterminadas que puedes ajustar según sea necesario:

- `loopSeconds`: El intervalo de tiempo en segundos que el bot espera antes de volver a verificar los pares de tokens. Por defecto, está configurado en 10 segundos.
- `maxProfit`: El multiplicador de ganancia deseado para vender un token después de comprarlo. Por ejemplo, un valor de 10 significa que el bot intentará vender el token cuando su valor se haya multiplicado por 10.
- `maxTimeAfterBuy`: El tiempo máximo en segundos después de comprar un token antes de que el bot intente venderlo. Esto es independiente del multiplicador de ganancia.
- `minLiquidityLockedUSD`: La cantidad mínima de liquidez en USD para que un par sea considerado por el bot. Se utiliza para filtrar pares con liquidez insuficiente.
- `telegramChatIds`: Una lista de IDs de chat de Telegram a las cuales el bot enviará notificaciones sobre sus operaciones. Debes incluir aquí tu propio ID de chat de Telegram.

Por ejemplo, tu archivo `.env` debería lucir así:

```
TEL_BOT_TOKEN=tu_token_de_bot_aquí
WALLET_FILE_PASSWORD=tu_contraseña_de_wallet_aquí
```

Asegúrate de reemplazar `tu_token_de_bot_aquí` y `tu_contraseña_de_wallet_aquí` con tus valores reales.




## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```bash
yarn install
```

## Ejecución

Para iniciar el bot, utiliza el siguiente comando:

```bash
yarn start
```

Este comando ejecutará el bot en modo de desarrollo, monitoreando cambios en los pares de tokens y ejecutando operaciones según las condiciones configuradas.

## Notas Importantes

- Este bot realiza operaciones financieras automatizadas y, como tal, conlleva riesgos. Asegúrate de entender completamente la estrategia antes de ejecutar el bot en un entorno de producción.
- La eficacia de la estrategia de trading depende de múltiples factores, incluida la rapidez con que la información de estado del token se actualiza y se puede acceder a ella a través de la API.

## Licencia

Especifica aquí tu licencia o si el proyecto es de código abierto.


