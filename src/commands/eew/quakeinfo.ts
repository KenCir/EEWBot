import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, EmbedBuilder, Attachment } from 'discord.js';
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
            .setTitle('地震情報')
            .setDescription(`${quakeInfo.time}頃、最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`)
            .addField('震源', '調査中')
            .addField('最大震度', quakeInfo.intensity)
            .addField('発生時刻', `${quakeInfo.time}頃`)
            .addField('震源の深さ', '調査中')
            .addField('マグニチュード', '調査中')
            .addField('北緯', '調査中')
            .addField('東経', '調査中')
            .setFooter({ text: 'NHK地震情報' })
            .setTimestamp(),
        ],
      });

      await interaction.followUp({
        files: [
          new Attachment(quakeInfo.detail),
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
            .addField('最大震度', quakeInfo.intensity)
            .addField('発生時刻', `${quakeInfo.time}頃`)
            .addField('震源の深さ', quakeInfo.depth)
            .addField('マグニチュード', quakeInfo.magnitude)
            .addField('北緯', quakeInfo.latitudey.replace('北緯', ''))
            .addField('東経', quakeInfo.longitude.replace('東経', ''))
            .setTimestamp(),
        ],
      });

      await interaction.followUp({
        files: [
          new Attachment(quakeInfo.detail),
          new Attachment(quakeInfo.local),
          new Attachment(quakeInfo.global),
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
