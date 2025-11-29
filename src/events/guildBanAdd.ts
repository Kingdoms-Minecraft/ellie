import { createEvent } from 'seyfert';
 
export default createEvent({
  data: { name: 'guildBanAdd' },
  async run(user, client) {
    client.messages.write(`${process.env.LOGS_CHANNEL}`, {content: `${user.user.username} has been banned.\nReason: ${await client.bans.fetch(user.guildId, user.user.id).then((GuildBan) => GuildBan.reason?.toString())}`});
  }
})