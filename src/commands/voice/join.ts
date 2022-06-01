import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { CommandInteraction, CacheType, GuildMember, Guild } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('join',
      'VCに参加して地震速報等の読み上げを開始する',
      'voice',
      (new SlashCommandBuilder()
        .setName('join')
        .setDescription('VCに参加して地震速報等の読み上げを開始する')
        .addChannelOption(option => option
          .setName('channel')
          .setDescription('読み上げするVCチャンネル')
          .setRequired(true),
        ) as SlashCommandBuilder),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR') && !(interaction.member as GuildMember).permissions.has('MOVE_MEMBERS')) {
      await interaction.followUp('このコマンドは管理者権限かメンバーを移動権限を持っている人のみ使用可能です');
      return;
    }

    const channel = interaction.options.getChannel('channel', true);
    if (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE') {
      await interaction.followUp('読み上げチャンネルはVCかステージチャンネルである必要があります');
      return;
    }

    client.database.removeVoiceStatus(interaction.guildId as string);
    client.database.addVoiceStatus(interaction.guildId as string);


    // 既にBot以外の誰かが参加していたなら
    if (channel.members.filter(m => !m.user.bot).size >= 1) {
      client.voicevoxClient.add(interaction.guildId as string, (interaction.member as GuildMember).voice.channelId as string, (interaction.guild as Guild).voiceAdapterCreator as DiscordGatewayAdapterCreator);
      await interaction.followUp('VCで読み上げを開始しました');
    }
    else {
      await interaction.followUp('VC読み上げチャンネルを設定しました');
    }
  }
}
