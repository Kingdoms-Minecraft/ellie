import { Declare, Command, type CommandContext, IgnoreCommand, TextInput, ActionRow, Modal } from 'seyfert';
import { Database } from "bun:sqlite";
import { TextInputStyle } from 'seyfert/lib/types';

const db = new Database(process.env.DB);

@Declare({
    name: 'apply',
    description: 'Starts your application.',
    ignore: IgnoreCommand.Message,
    contexts: ["Guild"],
    guildId: [`${process.env.GUILD}`]
})
export default class Apply extends Command {
    async run(ctx: CommandContext){
        if (ctx.channelId !== process.env.WHITELIST_CHANNEL){return;};

        try {
            const testDM = await ctx.client.users.write(ctx.author.id, { 
                content: 'Test DM. If you received this, you can ignore it.' 
            });
            await testDM.delete();
        } catch {
            ctx.write({ content: 'Please enable your DMs.', flags: 64 });
            return;
        }

        const alreadyExistsQuery = db.query('SELECT userId FROM Applications WHERE userId = ?');
        const alreadyExists = alreadyExistsQuery.get(ctx.author.id);

        if (alreadyExists) {
            return ctx.interaction.write({ content: 'You already have an application in progress.', flags: 64 });
        };

        const placeholderQuery = db.query(`INSERT INTO Applications (userId, questionNum, threadId) VALUES (?, ?, ?)`);
        
        let thread;
        try {
            thread = await ctx.client.threads.create(`${process.env.APPLICATIONS_CHANNEL}`, { 
                name: `${ctx.author.username}'s Application`, 
                message: { content: `${ctx.author.username}'s Application`
            } 
            });

            placeholderQuery.run(ctx.author.id, 1, thread.id);
        
            const nameInput = new TextInput()
            .setCustomId('name')
            .setStyle(TextInputStyle.Short)
            .setLabel('What is your minecraft username?')
            .setRequired(true);

            const ageInput = new TextInput()
            .setCustomId('age')
            .setStyle(TextInputStyle.Short)
            .setLabel('How old are you?')
            .setRequired(true);

            const playstyleInput = new TextInput()
            .setCustomId('playstyle')
            .setStyle(TextInputStyle.Short)
            .setLabel('How would you describe your playstyle?')
            .setRequired(false)
            
            const interestInput = new TextInput()
            .setCustomId('interest')
            .setStyle(TextInputStyle.Short)
            .setLabel('What made you interested in joining Kingdoms?')
            .setRequired(false)

            const row1 = new ActionRow<TextInput>().setComponents([nameInput]);
            const row2 = new ActionRow<TextInput>().setComponents([ageInput]);
            const row3 = new ActionRow<TextInput>().setComponents([playstyleInput]);
            const row4 = new ActionRow<TextInput>().setComponents([interestInput]);

            const modal = new Modal()
            .setCustomId(`application_${thread.id}`)
            .setTitle('Application')
            .setComponents([row1,row2,row3,row4])

            await ctx.interaction.modal(modal);

    } catch (e) {
        console.log(e);
        ctx.interaction.write({ content: `There was an error with your application.`, flags: 64 });
    }};
}