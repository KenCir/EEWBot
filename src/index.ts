/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-misused-promises */
import { readdirSync } from 'fs';
import { join } from 'path';
import express, { Express, urlencoded, json, Request, Response } from 'express';
import { config } from 'dotenv';
import logger from 'morgan';
import EEWBot from './EEWBot';
import { Command } from './interfaces/Command';
import { QuakeInfoData } from './interfaces/QuakeInfoData';
import notifyQuakeInfo from './functions/notifyQuakeInfo';
config();
const app: Express = express();
const client = new EEWBot();

app.use(urlencoded({
  extended: true,
}));
app.use(json());
app.use(logger('dev'));

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello World').end();
});

app.post('/quakeinfo', (req: Request, res: Response) => {
  const quakeInfoData: QuakeInfoData = req.body as QuakeInfoData;
  client.latestQuakeInfo = quakeInfoData;
  void notifyQuakeInfo(client, quakeInfoData);

  res.status(204).end();
});

app.listen(3000);

readdirSync(join(__dirname, '/events/process/'))
  .forEach(async file => {
    const event = await import(join(__dirname, `/events/process/${file}`));
    const eventName = file.split('.')[0];
    process.on(eventName, event.default.bind(null, client));
    client.logger.info(`Process ${eventName} event is Loading`);
  });

readdirSync(join(__dirname, '/events/discord/'))
  .forEach(async file => {
    const event = await import(join(__dirname, `/events/discord/${file}`));
    const eventName = file.split('.')[0];
    client.on(eventName, event.default.bind(null, client));
    client.logger.info(`Discord ${eventName} event is Loading`);
  });

const commandFolders = readdirSync(join(__dirname, '/commands'));
for (const folder of commandFolders) {
  readdirSync(join(__dirname, '/commands/', folder))
    .forEach(async file => {
      const command = await import(join(__dirname, '/commands/', folder, file));
      const cmd: Command = new command.default();
      client.commands.set(cmd.name, cmd);
      client.logger.info(`${cmd.name} command is Loading`);
    });
}

void client.login()
  .catch(() => process.exit(-1));
