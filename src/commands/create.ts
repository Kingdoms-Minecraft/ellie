import { 
    Command,
    CommandContext,
    Declare,
    ActionRow,
    Button
} from 'seyfert'
import { ButtonStyle } from 'seyfert/lib/types';

@Declare({
    name: 'createwhitelist',
    description: 'Create whitelist embed.',
    defaultMemberPermissions: ['Administrator'],
})
export default class Execute extends Command {
    async run(ctx: CommandContext) {

        const applyButton = new Button()
        .setCustomId('applyButton')
        .setStyle(ButtonStyle.Success)
        .setLabel('Apply');

        const cancelButton = new Button()
        .setCustomId('cancelButton')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Cancel');
 
        const row1 = new ActionRow<Button>().setComponents([applyButton]);
        const row2 = new ActionRow<Button>().setComponents([cancelButton]);

        ctx.client.messages.write(ctx.channelId, {
            embeds: [{
                title: 'Whitelist',
                description: 'Simply click on the apply button to begin. To cancel, click the cancel button.'
            }],
            components: [row1,row2]
        })
    }
}