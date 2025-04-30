import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const queue = "hello";

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    const message = "Hello World!";

    channel.sendToQueue(queue, Buffer.from(message));

    console.log("✅ Message sent to queue:", queue);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
