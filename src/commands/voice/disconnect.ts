import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, GuildMember } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('disconnect',
      'VCから退出する',
      'voice',
      new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('VCから退出する'),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR') && !(interaction.member as GuildMember).permissions.has('MOVE_MEMBERS')) {
      await interaction.followUp('このコマンドは管理者権限かメンバーを移動権限を持っている人のみ使用可能です');
      return;
    }

    if (!client.database.getVoiceStatus(interaction.guildId as string) && !client.voicevoxClient.get(interaction.guildId as string)) {
      await interaction.followUp('VCに参加してません');
      return;
    }

    client.database.removeVoiceStatus(interaction.guildId as string);
    client.voicevoxClient.leave(interaction.guildId as string);
    await interaction.followUp('読み上げを停止しました');
  }
}
