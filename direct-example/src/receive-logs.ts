import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("❌ Usage: pnpm run start:receive [info] [warning] [error]");
      process.exit(1);
    }

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "direct_logs";

    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log("✅ Waiting for messages in queue:", queue);

    args.forEach((severity) => {
      channel.bindQueue(queue, exchange, severity);
    });

    channel.consume(
      queue,
      (message) => {
        console.log("✅ Received message:", message?.content.toString());
        channel.ack(message!);
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
