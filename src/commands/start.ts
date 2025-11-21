import { 
    Command,
    CommandContext,
    Declare
} from 'seyfert';
import { $ } from 'bun';

@Declare({
    name: 'start',
    description: 'Starts the minecraft server',
    defaultMemberPermissions: ['Administrator']
})
export default class Start extends Command {
    async run(ctx: CommandContext){
        await $`cd ${process.env.SERVER_PATH} && ./start.sh 1 0`;
        await ctx.write({ content: 'Server starting.' });
    }
}