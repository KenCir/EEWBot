import { Message } from 'discord.js';
import EEWBot from '../../EEWBot';

export default async (client: EEWBot, message: Message) => {
    if (message.author.bot || message.author.system || !message.guild) return;

    if (!message.content.startsWith(process.env.PREFIX as string)) return;
    const args = message.content.slice((process.env.PREFIX as string).length).trim().split(/ +/g);
    const command = (args.shift() as string).toLowerCase();
    if (!command) return;
    // eslint-disable-next-line no-shadow
    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases.includes(command));
    if (!cmd) return;

    await cmd.run_message(client, message, args);
};