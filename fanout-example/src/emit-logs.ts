import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "logs";
    const messages = [
      "Hello World!",
      "Hello RabbitMQ!",
      "Hello Fanout!",
      "Hello Pub/Sub",
      "Hello Messaging!",
    ];

    channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    messages.forEach((message) => {
      channel.publish(exchange, "", Buffer.from(message));
      console.log("✅ Message sent to exchange:", message);
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
