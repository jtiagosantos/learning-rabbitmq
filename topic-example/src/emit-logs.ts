import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "topic_logs";
    const messages = [
      {
        routingKey: "kern.critical",
        message: "A critical kernel error occurred.",
      },
      {
        routingKey: "user.info",
        message: "User logged in successfully.",
      },
      {
        routingKey: "auth.error",
        message: "Authentication failed for user.",
      },
      {
        routingKey: "kern.warning",
        message: "Kernel warning: High memory usage.",
      },
    ];

    channel.assertExchange(exchange, "topic", {
      durable: false,
    });

    messages.forEach(({ routingKey, message }) => {
      channel.publish(exchange, routingKey, Buffer.from(message));
      console.log(
        "✅ Message sent to exchange:",
        message,
        "with routing key",
        routingKey
      );
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
