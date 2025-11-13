import { 
    Command,
    CommandContext,
    Declare,
    IgnoreCommand
} from 'seyfert'
import { Database } from "bun:sqlite";

const db = new Database(process.env.DB);

@Declare({
    name: 'cancel',
    description: 'Cancel your application.',
    ignore: IgnoreCommand.Message,
    guildId: [`${process.env.GUILD}`]
})
export default class Cancel extends Command {
    async run(ctx: CommandContext) {
        const checkUserQuery = await db.query('SELECT userId FROM Applications WHERE userId = ?');
        const existingUser = await checkUserQuery.get(ctx.author.id) as { userId: string } | null;
        
        if (!existingUser) return;

        const getThreadId = await db.query('SELECT threadId FROM Applications WHERE userId = ?');
        const threadResult = await getThreadId.get(ctx.author.id) as { threadId: string };

        await ctx.client.threads.edit(threadResult.threadId, {
            name: `${ctx.author.username}'s Application - CLOSED`
        })

        const deleteQuery = await db.query("DELETE FROM Applications WHERE threadId = ?");
                await deleteQuery.run(threadResult?.threadId);

        ctx.interaction.write({ content: 'Application cancelled.', flags: 64})
    }
}