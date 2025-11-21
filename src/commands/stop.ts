import { 
    Command,
    CommandContext,
    Declare
} from 'seyfert';

@Declare({
    name: 'stop',
    description: 'Stops the minecraft server',
    defaultMemberPermissions: ['Administrator']
})
export default class Start extends Command {
    async run(ctx: CommandContext){
        await ctx.client.rcon.exec('stop');
    }
}