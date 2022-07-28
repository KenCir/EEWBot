import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('quakeinfo',
      '最新の地震情報を表示する',
      'eew',
      new SlashCommandBuilder()
        .setName('quakeinfo')
        .setDescription('最新の地震情報を表示する'),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    const quakeInfo = client.latestQuakeInfo;
    if (!quakeInfo) {
      await interaction.followUp('データがありません');
      return;
    }

    if (quakeInfo.epicenter === '') {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('最新の地震情報')
            .setDescription(`${quakeInfo.time}頃、最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`)
            .addFields([
              { name: '震源', value: '調査中' },
              { name: '最大震度', value: quakeInfo.intensity },
              { name: '発生時刻', value: `${quakeInfo.time}頃` },
              { name: '震源の深さ', value: '調査中' },
              { name: 'マグニチュード', value: '調査中' },
              { name: '北緯', value: '調査中' },
              { name: '東経', value: '調査中' },
            ])
            .setFooter({ text: 'NHK地震情報' })
            .setTimestamp(),
        ],
      });

      await interaction.followUp({
        files: [
          new AttachmentBuilder(quakeInfo.detail),
        ],
      });

      if (quakeInfo.relatives instanceof Array) {
        for (const relative of quakeInfo.relatives) {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle(`震度${relative.intensity}を観測した場所`)
                .setDescription(relative.points.join('\n')),
            ],
          });
        }
      }
      else if (quakeInfo.relatives instanceof Object) {
        for (const relative in quakeInfo.relatives) {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle(`震度${quakeInfo.relatives[relative].intensity}を観測した場所`)
                .setDescription(quakeInfo.relatives[relative].points.join('\n')),
            ],
          });
        }
      }
    }
    else {
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('最新の地震情報')
            .setDescription(`${quakeInfo.time}頃、${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました`)
            .addFields([
              { name: '震源', value: quakeInfo.epicenter },
              { name: '最大震度', value: quakeInfo.intensity },
              { name: '発生時刻', value: `${quakeInfo.time}頃` },
              { name: '震源の深さ', value: quakeInfo.depth },
              { name: 'マグニチュード', value: quakeInfo.magnitude },
              { name: '北緯', value: quakeInfo.latitudey },
              { name: '東経', value: quakeInfo.longitude },
            ])
            .setFooter({ text: 'NHK地震情報' })
            .setTimestamp(),
        ],
      });

      await interaction.followUp({
        files: [
          new AttachmentBuilder(quakeInfo.detail),
          new AttachmentBuilder(quakeInfo.local),
          new AttachmentBuilder(quakeInfo.global),
        ],
      });

      if (quakeInfo.relatives instanceof Array) {
        for (const relative of quakeInfo.relatives) {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle(`震度${relative.intensity}を観測した場所`)
                .setDescription(relative.points.join('\n')),
            ],
          });
        }
      }
      else if (quakeInfo.relatives instanceof Object) {
        for (const relative in quakeInfo.relatives) {
          await interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setTitle(`震度${quakeInfo.relatives[relative].intensity}を観測した場所`)
                .setDescription(quakeInfo.relatives[relative].points.join('\n')),
            ],
          });
        }
      }
    }
  }
}
