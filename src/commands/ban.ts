// import { 
//     Command,
//     CommandContext,
//     createIntegerOption,
//     Declare,
//     Options
// } from 'seyfert'

// const options = {
//     ids: createIntegerOption({
//         description: 'The user(s) you are banning.',
//         required: true
//     })
// }

// @Declare({
//     name: 'bans',
//     description: 'Bans specified user(s)',
//     defaultMemberPermissions: ['BanMembers'],
// })
// @Options(options)
// export default class Execute extends Command {
//     async run(ctx: CommandContext<typeof options>) {
//         const ids = ctx.options.ids as any;
//         ids.foreach((id: any) => {
//             ctx.client.bans.create(ctx.guildId, )
//         })
//     }
// }