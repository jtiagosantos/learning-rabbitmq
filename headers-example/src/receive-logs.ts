import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "headers_logs";

    channel.assertExchange(exchange, "headers", {
      durable: false,
    });

    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log("✅ Waiting for messages in queue:", queue);

    channel.bindQueue(queue, exchange, "", {
      "x-match": "any",
      type: "kern",
      severity: "critical",
    });

    channel.consume(
      queue,
      (message) => {
        console.log(
          "✅ Received message:",
          message?.properties?.headers,
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
