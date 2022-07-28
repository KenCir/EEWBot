import { codeBlock } from '@discordjs/builders';
import { WebhookClient } from 'discord.js';
import EEWBot from '../../EEWBot';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export default async (client: EEWBot, error: Error) => {
  if (['Collector received no interactions before ending with reason: time', 'Collector received no interactions before ending with reason: messageDelete'].includes(error.message)) return;

  client.logger.error(error);

  if (!client.isReady()) return;
  const webhook = new WebhookClient({ url: process.env.ERRORLOG_WEBHOOK_URL as string });
  await webhook.send({
    content: `${codeBlock(error.stack as string)}`,
    avatarURL: client.user.avatarURL({ extension: 'webp' }) as string,
    username: `${client.user.username}-エラーログ`,
  });
};

