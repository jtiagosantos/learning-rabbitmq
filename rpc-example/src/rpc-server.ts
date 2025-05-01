import amqplib from "amqplib";
import { calculateFactorial } from "./helpers/calculate-factorial";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const queue = "rpc_queue";

    channel.assertQueue(queue, {
      durable: false,
    });

    channel.prefetch(1);

    console.log("🔄 Awaiting RPC requests");

    channel.consume(queue, (message) => {
      const number = parseInt(message!.content.toString());

      console.log("🔄 Received from Queue %d", number);

      const result = calculateFactorial(number);

      channel.sendToQueue(
        message!.properties.replyTo,
        Buffer.from(result.toString()),
        {
          correlationId: message!.properties.correlationId,
        }
      );

      console.log("✅ Sent to Callback Queue %d", result);

      channel.ack(message!);
    });
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
