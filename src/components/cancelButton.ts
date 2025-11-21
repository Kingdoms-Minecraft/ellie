import { ComponentCommand, type ComponentContext } from 'seyfert';
import { Database } from "bun:sqlite";

const db = new Database(process.env.DB);
 
export default class ApplyButton extends ComponentCommand {
  componentType = 'Button' as const;
 
  filter(ctx: ComponentContext<typeof this.componentType>) {
    return ctx.customId === 'cancelButton';
  }
 
  async run(ctx: ComponentContext<typeof this.componentType>) {
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