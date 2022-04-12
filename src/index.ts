import { readdirSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { config } from 'dotenv';
import logger from 'morgan';
import EEWBot from './EEWBot';
import { EEWData } from './interfaces/EEWData';
import notifyEEWData from './functions/notifyEEW';
import { Command } from './interfaces/Command';
import { QuakeInfoData } from './interfaces/QuakeInfoData';
import notifyQuakeInfo from './functions/notifyQuakeInfo';
config();
const app: express.Express = express();
const client = new EEWBot();

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());
app.use(logger('dev'));

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send('Hello World').end();
});

app.post('/eew', (req: express.Request, res: express.Response) => {
    const eewData: EEWData = req.body as EEWData;
    void notifyEEWData(client, eewData);

    res.status(204).end();
});

app.post('/quakeinfo', (req: express.Request, res: express.Response) => {
    const quakeInfoData: QuakeInfoData = req.body as QuakeInfoData;
    void notifyQuakeInfo(client, quakeInfoData);

    res.status(204).end();
});

app.listen(3000);

readdirSync(join(__dirname, '/events/process/'))
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .forEach(async file => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const event = await import(join(__dirname, `/events/process/${file}`));
        const eventName = file.split('.')[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        process.on(eventName, event.default.bind(null, client));
        client.logger.info(`Process ${eventName} event is Loading`);
    });

readdirSync(join(__dirname, '/events/discord/'))
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .forEach(async file => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const event = await import(join(__dirname, `/events/discord/${file}`));
        const eventName = file.split('.')[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        client.on(eventName, event.default.bind(null, client));
        client.logger.info(`Discord ${eventName} event is Loading`);
    });

const commandFolders = readdirSync(join(__dirname, '/commands'));
for (const folder of commandFolders) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    readdirSync(join(__dirname, '/commands/', folder))
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .forEach(async file => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const command = await import(join(__dirname, '/commands/', folder, file));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const cmd: Command = new command.default();
            client.commands.set(cmd.name, cmd);
            client.logger.info(`${cmd.name} command is Loading`);
        });
}

void client.login()
    .catch(() => process.exit(-1));