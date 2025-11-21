import { createEvent } from 'seyfert';
 
export default createEvent({
  data: { name: 'guildMemberAdd' },
  run(user, client) {
    client.messages.write(`${process.env.LOGS_CHANNEL}`, {content: `${user.username} has joined.`});
    client.messages.write(`${process.env.WELCOME_CHANNEL}`, {content: `${user.username} has joined. Welcome! Please check out <#${process.env.WHITELIST_CHANNEL}> to apply.`});
  }
})