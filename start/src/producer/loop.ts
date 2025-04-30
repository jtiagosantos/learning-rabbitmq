import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const queue = "hello";

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    const message = "Nova mensagem";
    let counter = 1;

    setInterval(() => {
      channel.sendToQueue(queue, Buffer.from(`${message} #${counter}`));

      console.log("✅ Message sent to queue:", `${message} #${counter}`);

      counter++;
    }, 1000);
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
