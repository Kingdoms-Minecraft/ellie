import { createEvent } from 'seyfert';
import { Database } from 'bun:sqlite';

const db = new Database(process.env.DB);

const getThreadId = db.query('SELECT threadId FROM Applications WHERE userId = ?');
const checkUserQuery = db.query('SELECT userId FROM Applications WHERE userId = ?');
const getUserIdFromThread = db.query('SELECT userId FROM Applications WHERE threadId = ?');

export default createEvent({
    data: { name: 'messageCreate' },
    async run(message, client) {
        if (message.author.bot) return;

        if (message.channelId === process.env.WHITELIST_CHANNEL) {
            message.delete();
            return;
        }

        if (!message.guildId) {
            const userExists = checkUserQuery.get(message.author.id) as { userId: string } | null;
            const threadResult = getThreadId.get(message.author.id) as { threadId: string } | null;

            if (!userExists || !threadResult) return;
            
            const threadId = threadResult.threadId;
            const currentApp = db.prepare('SELECT questionNum FROM Applications WHERE threadId = ?').get(threadId) as { questionNum: number } | null;
            let questionNum = currentApp?.questionNum;

            if (!questionNum || questionNum < 3) return;

            const attachments = message.attachments;
            if (attachments.length > 0) {
                attachments.forEach(attachment => {
                    message.client.messages.write(threadId, {
                        content: 'Project Screenshot:\n' + attachment.url +  (message.content ? '\n' + message.content : '')
                    });
                });
            } else {
                message.client.messages.write(threadId, { content: message.content })
            }
            return;
        }

        if ((await message.channel()).is(['PublicThread', 'PrivateThread']) && message.content.startsWith('\\')) {
            const threadId = message.channelId;
            const userResult = getUserIdFromThread.get(threadId) as { userId: string } | null;
            
            if (!userResult) return;

            const userId = userResult.userId;

            const attachments = message.attachments;
            
            client.users.write(userId, {
                content: `<@${message.author.id}> (${message.author.username}): ` + message.content.slice(1)
            })

            if (attachments.length > 0){
                attachments.forEach(attachment => {
                    client.users.write(userId, { content: attachment.url })
                })
            }
        }
    }
});