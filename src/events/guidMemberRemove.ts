import { createEvent } from 'seyfert';
 
export default createEvent({
  data: { name: 'guildMemberRemove' },
  run(user, client) {
    client.messages.write(`${process.env.LOGS_CHANNEL}`, {content: `${user.user.username} has left.`});
    client.messages.write(`${process.env.WELCOME_CHANNEL}`, {content: `Farewell, ${user.user.username}`});
  }
})