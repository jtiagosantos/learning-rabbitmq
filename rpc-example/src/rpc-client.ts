import amqplib from "amqplib";
import { randomUUID } from "node:crypto";

const bootstrap = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("❌ Usage: pnpm run start:client [number]");
      process.exit(1);
    }

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    //callback queue
    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    const correlationId = randomUUID();
    const number = parseInt(args[0]);

    console.log("🔄 Requesting factorial(%d)", number);

    //waiting for responses in the callback queue
    channel.consume(queue, (message) => {
      if (message?.properties.correlationId === correlationId) {
        console.log(
          "✅ Received from Callback Queue %d",
          parseInt(message.content.toString())
        );

        setTimeout(() => {
          connection.close();
          process.exit(0);
        }, 500);
      }
    });

    channel.sendToQueue("rpc_queue", Buffer.from(number.toString()), {
      correlationId,
      replyTo: queue,
    });
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
