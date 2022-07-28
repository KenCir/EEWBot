import { codeBlock } from '@discordjs/builders';
import { WebhookClient } from 'discord.js';
import EEWBot from '../../EEWBot';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export default async (client: EEWBot, reason: Error, promise: Promise<any>) => {
  if (['Collector received no interactions before ending with reason: time', 'Collector received no interactions before ending with reason: messageDelete'].includes(reason.message)) return;

  client.logger.error(reason);

  if (!client.isReady()) return;
  const webhook = new WebhookClient({ url: process.env.ERRORLOG_WEBHOOK_URL as string });
  await webhook.send({
    content: `${codeBlock(reason.stack as string)}`,
    avatarURL: client.user.avatarURL({ extension: 'webp' }) as string,
    username: `${client.user.username}-エラーログ`,
  });
};

