import { Interaction, InteractionType } from 'discord.js';
import EEWBot from '../../EEWBot';

export default async (client: EEWBot, interaction: Interaction) => {
  if (interaction.user.bot || !interaction.guild || interaction.type !== InteractionType.ApplicationCommand) return;

  await interaction.deferReply();
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return await interaction.followUp('Error: コマンドデータが見つかりませんでした');

  await cmd.run(client, interaction);
};
