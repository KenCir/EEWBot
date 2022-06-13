/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import SQLite3 from 'better-sqlite3';
import { VoiceStatus } from './VoiceStatus';
import { EEWChannelData } from './EEWChannelData';
import { QuakeInfoChannelData } from './QuakeInfoChannelData';
import { ReportedData } from './ReportedData';
import { VoiceEEWSetting } from './VoiceEEWSetting';
import { VoiceQuakeInfoSetting } from './VoiceQuakeInfoSetting';
import { TunamiChannelData } from './TunamiChannelData';

export default class Database {
  public readonly sql: SQLite3.Database;

  public constructor() {
    this.sql = new SQLite3('eew.db');

    const reportedDataTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'reported_data\';').get();
    if (!reportedDataTable['count(*)']) {
      this.sql.prepare('CREATE TABLE reported_data (id TEXT PRIMARY KEY);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_reported_data_id ON reported_data (id);').run();
    }

    // 緊急地震速報を通知するチャンネル
    const eewChannelTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'eew_channels\';').get();
    if (!eewChannelTable['count(*)']) {
      this.sql.prepare('CREATE TABLE eew_channels (channel_id TEXT PRIMARY KEY, min_intensity INTEGER, mention_roles TEXT);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_eew_channels_id ON eew_channels (channel_id);').run();
    }

    // 地震情報を通知するチャンネル
    const quakeInfoChannelTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'quakeinfo_channels\';').get();
    if (!quakeInfoChannelTable['count(*)']) {
      this.sql.prepare('CREATE TABLE quakeinfo_channels (channel_id TEXT PRIMARY KEY, min_intensity INTEGER, mention_roles TEXT, image INTEGER, relative INTEGER);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_quakeinfo_channels_id ON quakeinfo_channels (channel_id);').run();
    }

    // VC settings EEW
    const voiceEEWSettingTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'voice_eew_settings\';').get();
    if (!voiceEEWSettingTable['count(*)']) {
      this.sql.prepare('CREATE TABLE voice_eew_settings (guild_id TEXT PRIMARY KEY, min_intensity INTEGER);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_voice_eew_settings_id ON voice_eew_settings (guild_id);').run();
    }

    // VC settings QuakeInfo
    const voiceQuakeInfoSettingTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'voice_quakeinfo_settings\';').get();
    if (!voiceQuakeInfoSettingTable['count(*)']) {
      this.sql.prepare('CREATE TABLE voice_quakeinfo_settings (guild_id TEXT PRIMARY KEY, min_intensity INTEGER);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_voice_quakeinfo_settings_id ON voice_quakeinfo_settings (guild_id);').run();
    }

    // VC Status
    const voiceStatusTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'voice_status\';').get();
    if (!voiceStatusTable['count(*)']) {
      this.sql.prepare('CREATE TABLE voice_status (guild_id TEXT PRIMARY KEY, channel_id TEXT NOT NULL);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_voice_status_id ON voice_status (guild_id);').run();
    }

    // 津波情報を通知Channel
    const tunamiChannelTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'tunami_channels\';').get();
    if (!tunamiChannelTable['count(*)']) {
      this.sql.prepare('CREATE TABLE tunami_channels (channel_id TEXT PRIMARY KEY);').run();
      this.sql.prepare('CREATE UNIQUE INDEX idx_tunami_channels_id ON voice_status (channel_id);').run();
    }

    this.sql.pragma('synchronous = 1');
    this.sql.pragma('journal_mode = wal');
  }

  public shutdown(): void {
    this.sql.close();
  }

  /**
   * 通知済みの地震情報を取得する
   */
  public getReportedData(id: string): ReportedData | null {
    const data = this.sql.prepare('SELECT * FROM reported_data WHERE id = ?;').get(id);
    if (!data) return null;
    return data as ReportedData;
  }

  /**
   * 通知済みの地震情報を追加する
   */
  public addReportedData(id: string): void {
    if (this.getReportedData(id)) return;
    this.sql.prepare('INSERT INTO reported_data VALUES (?);').run(id);
  }

  /**
   * 緊急地震速報を通知するチャンネルをチャンネルIDで取得
   */
  public getEEWChannel(channelId: string): EEWChannelData | null {
    const data = this.sql.prepare('SELECT * FROM eew_channels WHERE channel_id = ?;').get(channelId);
    if (!data) return null;
    data.mention_roles = JSON.parse(data.mention_roles);
    return data as EEWChannelData;
  }

  /**
   * 緊急地震速報を通知するチャンネルの全取得
   */
  public getAllEEWChannel(intensity: number): Array<EEWChannelData> {
    const data = this.sql.prepare('SELECT * FROM eew_channels WHERE min_intensity <= ?;').all(intensity);
    for (const eew of data) {
      eew.mention_roles = JSON.parse(eew.mention_roles);
    }
    return data as Array<EEWChannelData>;
  }

  /**
   * 緊急地震速報を通知するチャンネルを追加する
   */
  public addEEWChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>): void {
    if (this.getEEWChannel(channelId)) return;
    this.sql.prepare('INSERT INTO eew_channels VALUES (?, ?, ?);').run(channelId, minIntensity, JSON.stringify(mentionRoles));
  }

  public editEEWChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>): void {
    if (!this.getEEWChannel(channelId)) return;
    this.sql.prepare('UPDATE eew_channels SET min_intensity = ?, mention_roles = ? WHERE channel_id = ?;').run(minIntensity, JSON.stringify(mentionRoles), channelId);
  }

  /**
   * 緊急地震速報を通知するチャンネルを削除する
   */
  public removeEEWChannel(channelId: string): void {
    if (!this.getEEWChannel(channelId)) return;
    this.sql.prepare('DELETE FROM eew_channels WHERE channel_id = ?;').run(channelId);
  }

  /**
   * 地震情報を通知するチャンネルを取得する
   */
  public getQuakeInfoChannel(channelId: string): QuakeInfoChannelData | null {
    const data = this.sql.prepare('SELECT * FROM quakeinfo_channels WHERE channel_id = ?;').get(channelId);
    if (!data) return null;
    data.mention_roles = JSON.parse(data.mention_roles);
    return data as QuakeInfoChannelData;
  }

  /**
   * 地震情報を通知するチャンネルの全取得
   */
  public getAllQuakeInfoChannel(intensity: number): Array<QuakeInfoChannelData> {
    const data = this.sql.prepare('SELECT * FROM quakeinfo_channels WHERE min_intensity <= ?;').all(intensity);
    for (const quakeInfo of data) {
      quakeInfo.mention_roles = JSON.parse(quakeInfo.mention_roles);
    }
    return data as Array<QuakeInfoChannelData>;
  }

  /**
   * 地震情報を通知するチャンネルを追加する
   */
  public addQuakeInfoChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>, image: number, relative: number): void {
    if (this.getQuakeInfoChannel(channelId)) return;
    this.sql.prepare('INSERT INTO quakeinfo_channels VALUES (?, ?, ?, ?, ?);').run(channelId, minIntensity, JSON.stringify(mentionRoles), image, relative);
  }

  public editQuakeInfoChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>, image: number, relative: number): void {
    if (!this.getQuakeInfoChannel(channelId)) return;
    this.sql.prepare('UPDATE quakeinfo_channels SET min_intensity = ?, mention_roles = ?, image = ?, relative = ? WHERE channel_id = ?;').run(minIntensity, JSON.stringify(mentionRoles), image, relative, channelId);
  }

  /**
   * 地震情報を通知するチャンネルを削除する
   */
  public removeQuakeInfoChannel(channelId: string): void {
    if (!this.getQuakeInfoChannel(channelId)) return;
    this.sql.prepare('DELETE FROM quakeinfo_channels WHERE channel_id = ?;').run(channelId);
  }

  public getVoiceEEWSetting(guildId: string): VoiceEEWSetting | undefined {
    return this.sql.prepare('SELECT * FROM voice_eew_settings WHERE guild_id = ?;').get(guildId);
  }

  public getAllVoiceEEWSetting(intensity: number): Array<VoiceEEWSetting> {
    const data = this.sql.prepare('SELECT * FROM voice_eew_settings WHERE min_intensity <= ?;').all(intensity);

    return data as Array<VoiceEEWSetting>;
  }

  public addVoiceEEWSetting(guildId: string, minIntensity: number): void {
    if (this.getVoiceEEWSetting(guildId)) return;
    this.sql.prepare('INSERT INTO voice_eew_settings VALUES (?, ?);').run(guildId, minIntensity);
  }

  public editVoiceEEWSetting(guildId: string, minIntensity: number): void {
    if (!this.getVoiceEEWSetting(guildId)) return;
    this.sql.prepare('UPDATE voice_eew_settings SET min_intensity = ? WHERE guild_id = ?;').run(minIntensity, guildId);
  }

  public getVoiceQuakeInfoSetting(guildId: string): VoiceQuakeInfoSetting | undefined {
    return this.sql.prepare('SELECT * FROM voice_quakeinfo_settings WHERE guild_id = ?;').get(guildId);
  }

  public getAllVoiceQuakeInfoSetting(intensity: number): Array<VoiceQuakeInfoSetting> {
    const data = this.sql.prepare('SELECT * FROM voice_quakeinfo_settings WHERE min_intensity <= ?;').all(intensity);

    return data as Array<VoiceQuakeInfoSetting>;
  }

  public addVoiceQuakeInfoSetting(guildId: string, minIntensity: number): void {
    if (this.getVoiceQuakeInfoSetting(guildId)) return;
    this.sql.prepare('INSERT INTO voice_quakeinfo_settings VALUES (?, ?);').run(guildId, minIntensity);
  }

  public editVoiceQuakeInfoSetting(guildId: string, minIntensity: number): void {
    if (!this.getVoiceQuakeInfoSetting(guildId)) return;
    this.sql.prepare('UPDATE voice_quakeinfo_settings SET min_intensity = ? WHERE guild_id = ?;').run(minIntensity, guildId);
  }

  public getAllVoiceStatus(): Array<VoiceStatus> {
    return this.sql.prepare('SELECT * FROM voice_status;').all() as Array<VoiceStatus>;
  }

  public getVoiceStatus(guildId: string): VoiceStatus | undefined {
    return this.sql.prepare('SELECT * FROM voice_status WHERE guild_id = ?;').get(guildId) as VoiceStatus;
  }

  public addVoiceStatus(guildId: string, channelId: string): void {
    if (this.getVoiceStatus(guildId)) return;

    this.sql.prepare('INSERT INTO voice_status VALUES (?, ?);').run(guildId, channelId);
  }

  public removeVoiceStatus(guildId: string): void {
    if (!this.getVoiceStatus(guildId)) return;

    this.sql.prepare('DELETE FROM voice_status WHERE guild_id = ?;').run(guildId);
  }

  public getTunamiChannel(channelId: string): TunamiChannelData | undefined {
    return this.sql.prepare('SELECT * FROM tunami_channels WHERE channel_id = ?;').get(channelId);
  }

  public getAllTunamiChannel(): Array<TunamiChannelData> {
    return this.sql.prepare('SELECT * FROM tunami_channels;').all();
  }

  public addTunamiChannel(channelId: string): void {
    if (this.getTunamiChannel(channelId)) return;

    this.sql.prepare('INSERT INTO tunami_channels (?);').run(channelId);
  }

  public removeTunamiChannel(channelId: string): void {
    if (!this.getTunamiChannel(channelId)) return;

    this.sql.prepare('DELETE FROM tunami_channels WHERE channel_id = ?;').run(channelId);
  }
}
