import { codeBlock } from '@discordjs/builders';
import { WebhookClient } from 'discord.js';
import EEWBot from '../../EEWBot';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export default async (client: EEWBot, info: string) => {
  client.logger.debug(info);

  if (!client.isReady()) return;
  const webhook = new WebhookClient({ url: process.env.DEBUGLOG_WEBHOOK_URL as string });
  await webhook.send({
    content: `${codeBlock(info)}`,
    avatarURL: client.user.avatarURL({ format: 'webp' }) as string,
    username: `${client.user.username}-デバッグログ`,
  });
};

