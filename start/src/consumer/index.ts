import amqplib from "amqplib";

const bootstrap = async () => {
  try {
    const queue = "hello";

    const connection = await amqplib.connect("amqp://localhost");

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: false,
    });

    console.log("✅ Waiting for messages in queue:", queue);

    channel.consume(
      queue,
      (message) => {
        console.log("✅ Received message:", message?.content.toString());
      },
      {
        noAck: true,
      }
    );

    //channel.prefetch(1); // Limit the number of unacknowledged messages to 1

    //manual acknowledgment mode
    /* channel.consume(
      queue,
      (message) => {
        setTimeout(() => {
          console.log("✅ Received message:", message?.content.toString());
          channel.ack(message!);
        }, 5000);
      },
      {
        noAck: false,
      }
    ); */
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
  }
};

bootstrap();
