/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, Message, ActionRowBuilder, ButtonBuilder, MessageComponentInteraction, EmbedBuilder, GuildMember, CommandInteractionOptionResolver, ButtonStyle, ActionRowData, ActionRowComponentData, MessageActionRowComponentBuilder } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  constructor() {
    super('delete',
      'チャンネルの設定を削除する',
      'eew',
      (new SlashCommandBuilder()
        .setName('delete')
        .setDescription('チャンネルの設定を削除する')
        .addSubcommand(subCommand => {
          return subCommand
            .setName('eew')
            .setDescription('緊急地震速報通知の削除');
        })
        .addSubcommand(subCommand => {
          return subCommand
            .setName('quakeinfo')
            .setDescription('地震通知の削除');
        })
        .addSubcommand(subCommand => {
          return subCommand
            .setName('tunami')
            .setDescription('津波予報通知の削除');
        }) as SlashCommandBuilder),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR') && !(interaction.member as GuildMember).permissions.has('MANAGE_CHANNELS')) {
      await interaction.followUp('このコマンドは管理者権限かチャンネルを管理権限を持っている人のみ使用可能です');
      return;
    }

    if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'eew') {
      if (!client.database.getEEWChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      const deleteMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('緊急地震速報通知の削除')
            .setDescription('緊急地震速報通知の削除を行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

        ],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('ok')
                .setEmoji('✅')
                .setStyle('PRIMARY'),
              new ButtonBuilder()
                .setCustomId('no')
                .setEmoji('❌')
                .setStyle('PRIMARY'),
            ),
        ],
      }) ;
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseDelete = await deleteMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      if (responseDelete.customId === 'no') {
        await responseDelete.update({
          content: '緊急地震速報通知削除をキャンセルしました',
          embeds: [],
          components: [],
        });
      }
      else if (responseDelete.customId === 'ok') {
        client.database.removeEEWChannel(interaction.channelId);
        await responseDelete.update({
          content: 'このチャンネルの緊急地震速報通知を削除しました',
          embeds: [],
          components: [],
        });
      }
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'quakeinfo') {
      if (!client.database.getQuakeInfoChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      const deleteMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知の削除')
            .setDescription('地震通知の削除を行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

        ],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('ok')
                .setEmoji('✅')
                .setStyle('PRIMARY'),
              new ButtonBuilder()
                .setCustomId('no')
                .setEmoji('❌')
                .setStyle('PRIMARY'),
            ),
        ],
      }) ;
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseDelete = await deleteMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      if (responseDelete.customId === 'no') {
        await responseDelete.update({
          content: '地震通知削除をキャンセルしました',
          embeds: [],
          components: [],
        });
      }
      else if (responseDelete.customId === 'ok') {
        client.database.removeEEWChannel(interaction.channelId);
        await responseDelete.update({
          content: 'このチャンネルの地震通知を削除しました',
          embeds: [],
          components: [],
        });
      }
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'tunami') {
      if (!client.database.getTunamiChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      const deleteMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('津波予報通知の削除')
            .setDescription('津波予報通知の削除を行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

        ],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('ok')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('no')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Primary),
            ) as unknown as ActionRowData<MessageActionRowComponentBuilder>,
        ],
      });
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseDelete = await deleteMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      if (responseDelete.customId === 'no') {
        await responseDelete.update({
          content: '津波予報通知削除をキャンセルしました',
          embeds: [],
          components: [],
        });
      }
      else if (responseDelete.customId === 'ok') {
        client.database.removeTunamiChannel(interaction.channelId);
        await responseDelete.update({
          content: 'このチャンネルの津波予報通知を削除しました',
          embeds: [],
          components: [],
        });
      }
    }
  }
}
