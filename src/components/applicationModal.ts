import { ModalCommand, ModalContext } from "seyfert";
import { Database } from "bun:sqlite";

const db = new Database(process.env.DB);

export default class ApplicationModal extends ModalCommand {
    filter(ctx: ModalContext) {
        return ctx.customId.startsWith('application');
    }

    async run(ctx: ModalContext){
        const threadId = ctx.customId.split('_')[1];
        const username = ctx.interaction.getInputValue('name', true);
        const age = ctx.interaction.getInputValue('age', true);
        const playstyle = ctx.interaction.getInputValue('playstyle', false);
        const interest = ctx.interaction.getInputValue('interest', false);

        const currentApp = db.prepare('SELECT questionNum FROM Applications WHERE threadId = ?').get(threadId) as { questionNum: number } | undefined;
        let questionNum = currentApp?.questionNum || 1;

        if (username) questionNum++;
        if (age) questionNum++;
        if (playstyle) questionNum++;
        if (interest) questionNum++;

        db.prepare('UPDATE Applications SET minecraft_name = ?, questionNum = ? WHERE threadId = ?')
            .run(username, questionNum, threadId);

        await ctx.client.messages.write(threadId, {
            content: `What is your minecraft username?: ${username}\nHow old are you?: ${age}\nHow would you describe your playstyle?: ${playstyle || null}\nWhat made you interested in joining Kingdoms?: ${interest || null}`
        });

        await ctx.interaction.write({content: 'Application submmited. Please check your DMs.', flags: 64});

        await ctx.client.users.createDM(ctx.author.id);
        await ctx.client.users.write(ctx.author.id, {embeds: [{
            title: 'Projects',
            description: 'We require everyone to submit project screenshots in order to be accepted. Please also try to describe the submitted projects if possible.',
            
        }]});
     }
}