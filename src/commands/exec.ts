import { 
    Command,
    CommandContext,
    Declare,
    Options,
    createStringOption
} from 'seyfert'

const options = {
    cmd: createStringOption({
        description: 'The command you are going to execute.',
        required: true
    })
};

@Declare({
    name: 'exec',
    description: 'Executes any command on the server.',
    defaultMemberPermissions: ['Administrator'],
})
@Options(options)
export default class Execute extends Command {
    async run(ctx: CommandContext<typeof options>) {
        let res = await ctx.client.rcon.exec(ctx.options.cmd)
        return await ctx.write({ content: res })
    }
}