import axios from 'axios';
import { MessageEmbed, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { BasicData } from '../interfaces/p2p/BasicData';
import { JMATunami } from '../interfaces/p2p/JMATunami';
const api = axios.create({ baseURL: 'https://api.p2pquake.net/v2/' });

export default async (client: EEWBot) => {
  const response = await api.get('history?limit=100');
  (response.data as Array<BasicData>).forEach(data => {
    // 地震情報
    if (data.code === 551) {
      // TODO: 管理者設定でNHKを通知するかP2Pを通知するかを切り替えられるようにする
    }
    // 津波予報
    else if (data.code === 552) {
      const tunamiData: JMATunami = data as JMATunami;
      client.database.getAllTunamiChannel()
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .forEach(async tunamiChannel => {
          const channel = client.channels.cache.get(tunamiChannel.channel_id) as TextChannel;
          if (!channel) client.database.removeTunamiChannel(tunamiChannel.channel_id);

          if (tunamiData.cancelled) {
            await channel.send('津波予報情報は解除されました');
          }

          await channel.send({
            embeds: [
              new MessageEmbed()
                .setTitle('津波予報情報'),
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
