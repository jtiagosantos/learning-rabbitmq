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

    const exchange = "topic_logs";

    channel.assertExchange(exchange, "topic", {
      durable: false,
    });

    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log("✅ Waiting for messages in queue:", queue);

    args.forEach((key) => {
      channel.bindQueue(queue, exchange, key);
    });

    channel.consume(
      queue,
      (message) => {
        console.log(
          "✅ Received message:",
          message?.fields?.routingKey,
          message?.content.toString()
        );
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
