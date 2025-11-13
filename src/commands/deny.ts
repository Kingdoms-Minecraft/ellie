import { 
    Command,
    CommandContext,
    Declare,
    IgnoreCommand,
    Options,
    createStringOption
} from 'seyfert'
import { Database } from "bun:sqlite";

const db = new Database(process.env.DB);

const options = {
    reason: createStringOption({
        description: 'The reason for denial.',
        required: true
    })
};

@Declare({
    name: 'deny',
    description: 'Deny an application.',
    defaultMemberPermissions: ['Administrator'],
    ignore: IgnoreCommand.Slash
})
@Options(options)
export default class Cancel extends Command {
    async run(ctx: CommandContext<typeof options>) {
        const getApplicationQuery = db.query('SELECT userId, threadId FROM Applications WHERE threadId = ?');
        const application = await getApplicationQuery.get(ctx.channelId) as { userId: string, threadId: string } | null;
        
        if (!application) return;

        const user = await ctx.client.users.fetch(application.userId);
        
        await ctx.client.threads.edit(application.threadId, {
            name: `${user.username}'s Application - DENIED`
        });

            await ctx.client.users.write(application.userId, {
                content: `Your application has been denied.\nReason: ${ctx.options.reason}`
            });

        const deleteQuery = db.query("DELETE FROM Applications WHERE threadId = ?");
        await deleteQuery.run(application.threadId);
    }
}