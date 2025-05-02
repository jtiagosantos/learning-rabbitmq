import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log("❌ Usage: pnpm run start:receive [pattern]");
      process.exit(1);
    }

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const dlx = "dlx_topic_logs";
    const dlq = "dlq_topic_logs";

    channel.assertExchange(dlx, "topic", {
      durable: false,
    });

    channel.assertQueue(dlq, {
      durable: false,
    });

    channel.bindQueue(dlq, dlx, "#");

    const { queue } = await channel.assertQueue("", {
      exclusive: true,
      arguments: {
        "x-dead-letter-exchange": dlx,
        //"x-dead-letter-routing-key": dlq,
      },
    });

    const exchange = "topic_logs";

    channel.assertExchange(exchange, "topic", {
      durable: false,
    });

    const pattern = args[0];

    channel.bindQueue(queue, exchange, pattern);

    console.log(
      "✅ Waiting for messages in queue:",
      queue,
      "with pattern:",
      pattern
    );
    console.log("❌ To exit press CTRL+C");

    channel.consume(
      queue,
      (message) => {
        console.log("✅ Received message:", message?.content.toString());
        channel.nack(message!, false, false);
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
