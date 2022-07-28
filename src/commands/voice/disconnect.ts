import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, GuildMember, PermissionFlagsBits } from 'discord.js';
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
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) && !(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.MoveMembers)) {
      await interaction.followUp('このコマンドは管理者権限かメンバーを移動権限を持っている人のみ使用可能です');
      return;
    }

    // voiceチェックを入れているのは万が一のため
    if (!client.database.getVoiceStatus(interaction.guildId as string) && !interaction.guild?.members.me?.voice.channelId) {
      await interaction.followUp('VCに参加してません');
      return;
    }

    client.database.removeVoiceStatus(interaction.guildId as string);
    // VoiceVOXClientからの参加
    if (client.voicevoxClient.get(interaction.guildId as string)) client.voicevoxClient.leave(interaction.guildId as string);
    else await interaction.guild?.members.me?.voice.disconnect();

    await interaction.followUp('読み上げを停止しました');
  }
}
