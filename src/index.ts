import { Client } from "seyfert";
import { Yuna } from "yunaforseyfert";
import { Rcon } from './rconts'
import { HandleCommand } from "seyfert/lib/commands/handle";
import { ActivityType, GatewayPresenceUpdateData, PresenceUpdateStatus } from "seyfert/lib/types";

let auth = false;

declare module "seyfert" {
    interface Client {
        rcon: Rcon;
    }

    interface UsingClient extends Client {}
}

class CommandHandler extends HandleCommand {
    argsParser = Yuna.parser()
}

const rcon = new Rcon({
    host: process.env.HOST + "",
    port: 25015,
    password: process.env.PASSWORD + "",
    
})

rcon.on("authenicated", async () => {
    console.log('RCON Connected.')
    auth = true;
});

rcon.on('disconnected', async () => {
    auth = false;
});

const client = new Client({
    commands: {
        prefix: () => {
            return [';'];
        },
        reply: () => true
    }
});

setInterval(async () => {
    const presenceData: GatewayPresenceUpdateData = {
        activities: [{
            name: `Server ${auth ? 'Online' : 'Offline'}`,
            type: ActivityType.Watching
        }],
        status: PresenceUpdateStatus.Online,
        since: Date.now(),
        afk: false
    };
    
    client.gateway.setPresence(presenceData);
}, 20000);

client.rcon = rcon;

(async () => {
    client.setServices({
        handleCommand: CommandHandler
    });

    await client.start()
    .then(() => client.uploadCommands({ cachePath: './commands.json' }));

    (async () => {
        while (true) {
            try {
                await rcon.connect();
                break;
            } catch {
                await Bun.sleep(3000);
            }
        }
    })();
})();
