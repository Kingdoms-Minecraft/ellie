import {
    Command,
    CommandContext,
    Declare,
    IgnoreCommand
} from 'seyfert';
import { Database } from "bun:sqlite";

const db = new Database(process.env.DB);

async function validAccount(username: string): Promise<string | null> {
    try {
        const response = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${username}`);
        if (response.status === 200) {
            const data = await response.json();
            return data.name;
        } else if (response.status === 204 || response.status === 404) {
            return null;
        } else {
            console.log(`Error checking ${username}`);
            return null;
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

@Declare({
    name: 'accept',
    description: 'Accept the users application.',
    defaultMemberPermissions: ["Administrator"],
    ignore: IgnoreCommand.Slash
})
export default class Apply extends Command {
    async run(ctx: CommandContext) {
        const channelId = ctx.channelId;

        if (!ctx.guildId) {
            return await ctx.editOrReply({
                content: "This command can only be used in a server."
            });
        }

        const query = db.query("SELECT * FROM Applications WHERE threadId = ?");
        const application = query.get(channelId) as any;

        const minecraftUsername = application.minecraft_name;
        const userId = application.userId

        if (!userId) {
            return await ctx.editOrReply({
                content: "No user ID found in the application."
            });
        }

        let isValid = false;
        let finalUsername = minecraftUsername;

        try {
            const validaccount = await validAccount(minecraftUsername);
            if (validaccount) {
                isValid = true;
                finalUsername = validaccount;
            }

            if (isValid) {
                await ctx.client.rcon.exec(`whitelist add ${finalUsername}`)

                await ctx.client.members.addRole(ctx.guildId, userId, `${process.env.WHITELIST_ROLE}`)

                await ctx.client.threads.edit(ctx.channelId, {
                    name: `${(await ctx.client.users.fetch(userId)).username}'s Application - ACCEPTED`
                })

                const deleteQuery = db.query("DELETE FROM Applications WHERE threadId = ?");
                deleteQuery.run(channelId);

                await ctx.editOrReply({
                    content: `Whitelisted ${finalUsername}.`
                });

                await ctx.client.users.write(userId, { content: `You've been whitelisted in ${(await ctx.client.guilds.fetch(ctx.guildId)).name.toString()}! Congratulations. Please check out <#${process.env.WHITELIST_CHANNEL}>.` });
            } else {
                await ctx.editOrReply({
                    content: `Invalid Minecraft account for ${minecraftUsername}. Please check that the username is correct.`
                });
            }
        } catch (error) {
            console.error('Error during whitelist process:', error);
            await ctx.editOrReply({
                content: `An error occurred during the whitelist process: ${error}`
            });
        }
    }
}