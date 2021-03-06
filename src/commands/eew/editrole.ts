import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionFlagsBits, Role } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('editrole',
      '通知するロールの編集',
      'eew',
      (new SlashCommandBuilder()
        .setName('editrole')
        .setDescription('通知設定の編集をする')
        .addSubcommand(subCommand => {
          return subCommand
            .setName('eew')
            .setDescription('緊急地震速報通知の編集')
            .addRoleOption(option => option
              .setName('role')
              .setDescription('設定するロール')
              .setRequired(true),
            );
        })
        .addSubcommand(subCommand => {
          return subCommand
            .setName('quakeinfo')
            .setDescription('地震通知の編集')
            .addRoleOption(option => option
              .setName('role')
              .setDescription('設定するロール')
              .setRequired(true),
            );
        }) as SlashCommandBuilder),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) && !(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.followUp('このコマンドは管理者権限かチャンネルを管理権限を持っている人のみ使用可能です');
      return;
    }

    const role = (interaction.options as CommandInteractionOptionResolver).getRole('role') as Role;
    if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'eew') {
      const eewNotifyData = client.database.getEEWChannel(interaction.channelId);
      if (!eewNotifyData) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      if (eewNotifyData.mention_roles.includes(role.id)) {
        eewNotifyData.mention_roles = eewNotifyData.mention_roles.filter(v => v !== role.id);
        client.database.editEEWChannel(eewNotifyData.channel_id, eewNotifyData.min_intensity, eewNotifyData.mention_roles);
        await interaction.followUp(`${role.name}を緊急地震速報通知ロールから削除しました`);
      }
      else {
        eewNotifyData.mention_roles.push(role.id);
        client.database.editEEWChannel(eewNotifyData.channel_id, eewNotifyData.min_intensity, eewNotifyData.mention_roles);
        await interaction.followUp(`${role.name}を緊急地震速報通知ロールに追加しました`);
      }
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'quakeinfo') {
      const quakeInfoNotifyData = client.database.getQuakeInfoChannel(interaction.channelId);
      if (!quakeInfoNotifyData) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      if (quakeInfoNotifyData.mention_roles.includes(role.id)) {
        quakeInfoNotifyData.mention_roles = quakeInfoNotifyData.mention_roles.filter(v => v !== role.id);
        client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, quakeInfoNotifyData.image, quakeInfoNotifyData.relative);
        await interaction.followUp(`${role.name}を地震通知ロールから削除しました`);
      }
      else {
        quakeInfoNotifyData.mention_roles.push(role.id);
        client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, quakeInfoNotifyData.image, quakeInfoNotifyData.relative);
        await interaction.followUp(`${role.name}を地震通知ロールに追加しました`);
      }
    }
  }
}
