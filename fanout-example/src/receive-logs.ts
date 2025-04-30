import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    const exchange = "logs";

    channel.assertExchange(exchange, "fanout", {
      durable: false,
    });

    const { queue } = await channel.assertQueue("", {
      exclusive: true,
    });

    console.log("✅ Waiting for messages in queue:", queue);

    channel.bindQueue(queue, exchange, "");

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
