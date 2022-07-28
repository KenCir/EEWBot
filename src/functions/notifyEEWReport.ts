import { codeBlock, roleMention } from '@discordjs/builders';
import { AttachmentBuilder, EmbedBuilder, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { EEWReportData } from '../interfaces/EEWReportData';
import axios from 'axios';
import { getEEWTime } from '../utils/Time';
import { intensityStringToNumber } from '../utils/IntensityUtil';

let oldEEWData: EEWReportData | null = null;
let notifyChannels: Array<string> = [];

export default async (client: EEWBot) => {
  try {
    const remoteURL = 'http://www.kmoni.bosai.go.jp/webservice/hypo/eew/';
    const eewResponse = await axios.get(`${remoteURL}${getEEWTime(-1)}.json`);
    const eewData: EEWReportData = eewResponse.data as EEWReportData;

    if (eewData.result.status !== 'success' || eewData.result.message === 'データがありません') {
      oldEEWData = null;
      return;
    }
    else if (oldEEWData && Number(eewData.report_num) <= Number(oldEEWData?.report_num)) {
      return;
    }
    else if (client.database.getReportedData(eewData.report_id)) {
      oldEEWData = null;
      return;
    }

    const notifyGuilds = client.database.getAllVoiceEEWSetting(intensityStringToNumber(eewData.calcintensity)).map(setting => setting.guild_id);
    if (!oldEEWData) {
      client.voicevoxClient.notify(`緊急地震速報を受信しました。震源は${eewData.region_name}、予想される最大震度は${eewData.calcintensity}、予想されるマグニチュードは${eewData.magunitude}です`, notifyGuilds)
        .catch(e => client.logger.error(e));
    }
    else if (eewData.is_final) {
      client.voicevoxClient.notify(`緊急地震速報の最終報を受信しました。震源は${eewData.region_name}、予想される最大震度は${eewData.calcintensity}、予想されるマグニチュードは${eewData.magunitude}です`, notifyGuilds)
        .catch(e => client.logger.error(e));
    }

    let diff = '';
    if (oldEEWData) {
      if (oldEEWData.region_name !== eewData.region_name) {
        diff += `震央: ${oldEEWData.region_name} -> ${eewData.region_name}\n`;
      }
      if (oldEEWData.depth !== eewData.depth) {
        diff += `深さ: ${oldEEWData.depth} -> ${eewData.depth}\n`;
      }
      if (oldEEWData.magunitude !== eewData.magunitude) {
        diff += `マグニチュード: ${oldEEWData.magunitude} -> ${eewData.magunitude}\n`;
      }
      if (oldEEWData.calcintensity !== eewData.calcintensity) {
        diff += `予想震度: ${oldEEWData.calcintensity} -> ${eewData.calcintensity}\n`;
      }
      if (oldEEWData.latitude !== eewData.latitude) {
        diff += `予想北緯: ${oldEEWData.latitude} -> ${eewData.latitude}\n`;
      }
      if (oldEEWData.longitude !== eewData.longitude) {
        diff += `予想東経: ${oldEEWData.longitude} -> ${eewData.longitude}\n`;
      }
    }

    client.database.getAllEEWChannel(intensityStringToNumber(eewData.calcintensity))
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach(async eewChannelData => {
        const eewChannel: TextChannel = client.channels.cache.get(eewChannelData.channel_id) as TextChannel;
        if (!eewChannel) {
          client.database.removeEEWChannel(eewChannelData.channel_id);
          return;
        }

        // キャンセル報
        if (eewData.is_cancel === true) {
          await eewChannel.send('緊急地震速報はキャンセルされました');

          return;
        }

        if (!notifyChannels.includes(eewChannelData.channel_id)) notifyChannels.push(eewChannelData.channel_id);

        // 予想最大震度3未満
        if (intensityStringToNumber(eewData.calcintensity) < 3) {
          if (oldEEWData && diff.length > 0) {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? `緊急地震速報\n${codeBlock(diff)}` : `${eewChannelData.mention_roles.map(role => roleMention(role)).join('')}\n${codeBlock(diff)}`,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Aqua')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
          else {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? '緊急地震速報' : eewChannelData.mention_roles.map(role => roleMention(role)).join(''),
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Aqua')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
        }
        // 予想震度3以上5弱未満
        else if (intensityStringToNumber(eewData.calcintensity) < 5) {
          if (oldEEWData && diff.length > 0) {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? `緊急地震速報\n${codeBlock(diff)}` : `${eewChannelData.mention_roles.map(role => roleMention(role)).join('')}\n${codeBlock(diff)}`,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Yellow')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
          else {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? '緊急地震速報' : eewChannelData.mention_roles.map(role => roleMention(role)).join(''),
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Yellow')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
        }
        // 予想震度5弱以上
        else {
          // eslint-disable-next-line no-lonely-if
          if (oldEEWData && diff.length > 0) {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? `緊急地震速報\n${codeBlock(diff)}` : `${eewChannelData.mention_roles.map(role => roleMention(role)).join('')}\n${codeBlock(diff)}`,
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Red')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
          else {
            await eewChannel.send({
              content: eewChannelData.mention_roles.length < 1 || notifyChannels.includes(eewChannelData.channel_id) ? '緊急地震速報' : eewChannelData.mention_roles.map(role => roleMention(role)).join(''),
              embeds: [
                new EmbedBuilder()
                  .setTitle(`緊急地震速報(${eewData.alertflg}) 第${eewData.is_final ? '最終' : eewData.report_num}報`)
                  .addFields([
                    { name: '震央', value: eewData.region_name, inline: true },
                    { name: '予想震度', value: eewData.calcintensity, inline: true },
                    { name: '深さ', value: eewData.depth, inline: true },
                    { name: 'マグニチュード', value: eewData.magunitude, inline: true },
                    { name: '緯度', value: eewData.latitude, inline: true },
                    { name: '経度', value: eewData.longitude, inline: true },
                  ])
                  .setColor('Aqua')
                  .setColor('Red')
                  .setImage('AttachmentBuilder://nowMonitor.png')
                  .setFooter({ text: '強震モニタより' })
                  .setTimestamp(),
              ],
              files: [
                new AttachmentBuilder('dat/nowMonitor.png'),
              ],
            });
          }
        }
      });

    if (eewData.is_final) {
      client.database.addReportedData(eewData.report_id);
      notifyChannels = [];
    }
    else {
      oldEEWData = eewData;
    }
  }
  // eslint-disable-next-line no-empty
  catch (e) {
  }
};
