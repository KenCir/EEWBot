/* eslint-disable @typescript-eslint/no-misused-promises */
import axios from 'axios';
import { EmbedBuilder, roleMention, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { BasicData } from '../interfaces/p2p/BasicData';
import { JMAQuake } from '../interfaces/p2p/JMAQuake';
import { JMATunami } from '../interfaces/p2p/JMATunami';
import { intensityNumberToString, intensityStringToNumber } from '../utils/IntensityUtil';
import { expresentationTypeEnumToString } from '../utils/PresentationUtil';
import { tunamiEnumToString } from '../utils/TunamiUtil';
const api = axios.create();

export default async (client: EEWBot) => {
  const response = await api.get('https://api.p2pquake.net/v2/history?codes=551&codes=552');
  (response.data as Array<BasicData>).forEach(data => {
    // 地震情報
    if (data.code === 551) {
      const quakeData: JMAQuake = data as JMAQuake;
      if (client.database.getReportedData(quakeData.id)) return;
      client.database.addReportedData(quakeData.id);

      client.database.getAllQuakeInfoChannel(intensityStringToNumber(quakeData.earthquake.maxScale))
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .forEach(async quakeInfoChannelData => {
          const quakeInfoChannel: TextChannel = client.channels.cache.get(quakeInfoChannelData.channel_id) as TextChannel;
          if (!quakeInfoChannel) {
            client.database.removeQuakeInfoChannel(quakeInfoChannelData.channel_id);
            return;
          }

          // 震源情報が入っていないぞ！
          if (quakeData.earthquake.hypocenter.name === '') {
            await quakeInfoChannel.send({
              content: quakeInfoChannelData.mention_roles.length < 1 ? '地震情報' : quakeInfoChannelData.mention_roles.map(role => roleMention(role)).join(''),
              embeds: [
                new EmbedBuilder()
                  .setTitle('地震情報')
                  .setDescription(`${quakeData.earthquake.time}頃、最大震度${intensityNumberToString(quakeData.earthquake.maxScale)}の地震がありました、今後の地震情報に注意してください`)
                  .addFields([
                    { name: '震源', value: quakeData.earthquake.hypocenter.name === '' ? '震源情報が未発表です' : quakeData.earthquake.hypocenter.name },
                    { name: '最大震度', value: intensityNumberToString(quakeData.earthquake.maxScale) },
                    { name: '発生時刻', value: `${quakeData.earthquake.time}頃` },
                    { name: '震源の深さ', value: quakeData.earthquake.hypocenter.depth === 0 ? 'ごく浅い' : quakeData.earthquake.hypocenter.depth === -1 ? '震源情報が存在しません' : `${quakeData.earthquake.hypocenter.depth.toString()}km` },
                    { name: 'マグニチュード', value: quakeData.earthquake.hypocenter.magnitude.toString() },
                    { name: '北緯', value: quakeData.earthquake.hypocenter.latitude.toString() },
                    { name: '東経', value: quakeData.earthquake.hypocenter.longitude.toString() },
                    { name: '国内での津波の有無', value: tunamiEnumToString(quakeData.earthquake.domesticTsunami) },
                    { name: '海外での津波の有無', value: tunamiEnumToString(quakeData.earthquake.foreignTsunami) },
                  ])
                  .setFooter({ text: `P2P地震情報|${quakeData.issue.source}|${expresentationTypeEnumToString(quakeData.issue.type)}|${quakeData.time}に発表しました` })
                  .setTimestamp(),
              ],
            });
          }
          else {
            await quakeInfoChannel.send({
              content: quakeInfoChannelData.mention_roles.length < 1 ? '地震情報' : quakeInfoChannelData.mention_roles.map(role => roleMention(role)).join(''),
              embeds: [
                new EmbedBuilder()
                  .setTitle('地震情報')
                  .setDescription(`${quakeData.earthquake.time}頃、${quakeData.earthquake.hypocenter.name}を震源とする最大震度${intensityNumberToString(quakeData.earthquake.maxScale)}の地震がありました`)
                  .addFields([
                    { name: '震源', value: quakeData.earthquake.hypocenter.name === '' ? '震源情報が未発表です' : quakeData.earthquake.hypocenter.name },
                    { name: '最大震度', value: intensityNumberToString(quakeData.earthquake.maxScale) },
                    { name: '発生時刻', value: `${quakeData.earthquake.time}頃` },
                    { name: '震源の深さ', value: quakeData.earthquake.hypocenter.depth === 0 ? 'ごく浅い' : quakeData.earthquake.hypocenter.depth === -1 ? '震源情報が存在しません' : quakeData.earthquake.hypocenter.depth.toString() },
                    { name: 'マグニチュード', value: quakeData.earthquake.hypocenter.magnitude.toString() },
                    { name: '北緯', value: quakeData.earthquake.hypocenter.latitude.toString() },
                    { name: '東経', value: quakeData.earthquake.hypocenter.longitude.toString() },
                    { name: '国内での津波の有無', value: tunamiEnumToString(quakeData.earthquake.domesticTsunami) },
                    { name: '海外での津波の有無', value: tunamiEnumToString(quakeData.earthquake.foreignTsunami) },
                  ])
                  .setFooter({ text: `P2P地震情報|${quakeData.issue.source}|${expresentationTypeEnumToString(quakeData.issue.type)}|${quakeData.time}に発表しました` })
                  .setTimestamp(),
              ],
            });
          }
        });
    }
    // 津波予報
    else if (data.code === 552) {
      const tunamiData: JMATunami = data as JMATunami;
      if (client.database.getReportedData(tunamiData.id)) return;
      client.database.addReportedData(tunamiData.id);
      client.database.getAllTunamiChannel()
        .forEach(async tunamiChannel => {
          const channel = client.channels.cache.get(tunamiChannel.channel_id) as TextChannel;
          if (!channel) client.database.removeTunamiChannel(tunamiChannel.channel_id);

          if (tunamiData.cancelled) {
            await channel.send('先ほどの津波予報情報は解除されました');
            return;
          }

          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle('津波予報情報')
                .setDescription(tunamiData.areas.map(area => `${tunamiEnumToString(area.grade)} ${area.name} ${area.immediate ? '直ちに津波が到達する可能性有り' : ''}`).join('\n'))
                .setFooter({ text: `${tunamiData.issue.source}が${tunamiData.time}に発表しました|P2P地震情報` }),
            ],
          });
        });
    }
    // 緊急地震速報 発表検知
    else if (data.code === 554) {
      // TODO: 管理者設定で強震モニタを通知するかP2Pを通知するかを切り替えられるようにする
    }
    // 各地域ピア数
    else if (data.code === 555) {
      // ?
    }
    // 地震感知情報
    else if (data.code === 561) {
      // ?
    }
    // 地震感知情報 解析結果
    else if (data.code === 9611) {
      // ?
    }
    // どこにも一致しなかった時はエラー出しておく
    else {
      throw new Error(`Unknown code ${data.code}`);
    }
  });
};
