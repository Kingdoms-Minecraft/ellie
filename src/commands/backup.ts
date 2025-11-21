import { 
    Command,
    CommandContext,
    Declare
} from 'seyfert';
import { $ } from 'bun';

@Declare({
    name: 'backup',
    description: 'Backup the minecraft server.',
    defaultMemberPermissions: ['Administrator']
})
export default class Start extends Command {
    async run(ctx: CommandContext){
        await $`cd ${process.env.SERVER_PATH}/scripts && ./backup.sh`;
        await ctx.write({content: 'Server backed up.'});
    }
}