import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "direct_logs";
    const messages = [
      {
        severity: "info",
        message: "Hello World!",
      },
      {
        severity: "error",
        message: "Hello RabbitMQ!",
      },
      {
        severity: "warning",
        message: "Hello Direct!",
      },
      {
        severity: "info",
        message: "Hello Pub/Sub",
      },
      {
        severity: "error",
        message: "Hello Messaging!",
      },
    ];

    channel.assertExchange(exchange, "direct", {
      durable: false,
    });

    messages.forEach(({ severity, message }) => {
      channel.publish(exchange, severity, Buffer.from(message));
      console.log(
        "✅ Message sent to exchange:",
        message,
        "with severity",
        severity
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
