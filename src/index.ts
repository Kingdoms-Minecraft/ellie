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
    port: process.env.PORT as unknown as number,
    password: process.env.PASSWORD + "",
    
})

rcon.on("authenicated", async () => {
    console.log('RCON Connected.')
    auth = true;
});

rcon.on('disconnected', async () => {
    auth = false;
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
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

setInterval(async () => {
    const start = Date.now();
    console.log('Keepalive', start);
    await new Promise(resolve => setTimeout(resolve, 100));
}, 1000);

client.rcon = rcon;

(async () => {
    client.setServices({
        handleCommand: CommandHandler
    });

    await client.start();
    // .then(() => client.uploadCommands({ cachePath: './commands.json' }));

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
