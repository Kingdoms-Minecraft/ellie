import { createEvent, Embed, Message } from 'seyfert';

export default createEvent({
  data: { name: 'messageDelete' },

  async run(message, client) {
    if (!("content" in message)) return;
    if (message.author.bot) return;
    const embed = new Embed()
    .setTitle(`Message deleted`)
    .setDescription(`Channel: <#${message.channelId}>\nAuthor: ${message.author.username}\nMessage: ${message.content}`)

    client.messages.write(`${process.env.LOGS_CHANNEL}`, {embeds: [embed]});
  }
});
