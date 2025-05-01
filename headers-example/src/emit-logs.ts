import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "headers_logs";
    const messages = [
      {
        headers: {
          "x-match": "all",
          type: "kern",
          severity: "critical",
        },
        message: "A critical kernel error occurred.",
      },
      {
        headers: {
          "x-match": "any",
          type: "user",
          severity: "info",
        },
        message: "User logged in successfully.",
      },
      {
        headers: {
          "x-match": "all",
          type: "auth",
          severity: "error",
        },
        message: "Authentication failed for user.",
      },
      {
        headers: {
          "x-match": "any",
          type: "kern",
          severity: "warning",
        },
        message: "Kernel warning: High memory usage.",
      },
    ];

    channel.assertExchange(exchange, "headers", {
      durable: false,
    });

    messages.forEach(({ headers, message }) => {
      channel.publish(exchange, "", Buffer.from(message), { headers });
      console.log(
        "✅ Message sent to exchange:",
        message,
        "with headers",
        headers
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
