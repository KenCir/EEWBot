/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import SQLite3 from 'better-sqlite3';
import { EEWChannelData } from './EEWChannelData';
import { QuakeInfoChannelData } from './QuakeInfoChannelData';
import { ReportedData } from './ReportedData';

export default class Database {
    public readonly sql: SQLite3.Database;

    public constructor() {
        this.sql = new SQLite3('eew.db');

        const reportedDataTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'reported_datas\';').get();
        if (!reportedDataTable['count(*)']) {
            this.sql.prepare('CREATE TABLE reported_datas (id TEXT PRIMARY KEY);').run();
            this.sql.prepare('CREATE UNIQUE INDEX idx_reported_data_id ON reported_datas (id);').run();
        }

        // 緊急地震速報を通知するチャンネル
        const eewChannelTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'eew_channels\';').get();
        if (!eewChannelTable['count(*)']) {
            this.sql.prepare('CREATE TABLE eew_channels (channelid TEXT PRIMARY KEY, min_intensity INTEGER, mention_roles TEXT);').run();
            this.sql.prepare('CREATE UNIQUE INDEX idx_eew_channels_id ON eew_channels (channelid);').run();
        }

        // 地震情報を通知するチャンネル
        const quakeInfoChannelTable = this.sql.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'quakeinfo_channels\';').get();
        if (!quakeInfoChannelTable['count(*)']) {
            this.sql.prepare('CREATE TABLE quakeinfo_channels (channelid TEXT PRIMARY KEY, min_intensity INTEGER, mention_roles TEXT, image INTEGER, relative INTEGER);').run();
            this.sql.prepare('CREATE UNIQUE INDEX idx_quakeinfo_channels_id ON quakeinfo_channels (channelid);').run();
        }

        this.sql.pragma('synchronous = 1');
        this.sql.pragma('journal_mode = wal');
    }

    /**
     * 通知済みの地震情報を取得する
     */
    public getReportedData(id: string): ReportedData | null {
        const data = this.sql.prepare('SELECT * FROM reported_datas WHERE id = ?;').get(id);
        if (!data) return null;
        return data as ReportedData;
    }

    /**
     * 通知済みの地震情報を追加する
     */
    public addReportedData(id: string): void {
        if (this.getReportedData(id)) return;
        this.sql.prepare('INSERT INTO reported_datas VALUES (?);').run(id);
    }

    /**
     * 緊急地震速報を通知するチャンネルをチャンネルIDで取得
     */
    public getEEWChannel(channelId: string): EEWChannelData | null {
        const data = this.sql.prepare('SELECT * FROM eew_channels WHERE channelid = ?;').get(channelId);
        if (!data) return null;
        data.mention_roles = JSON.parse(data.mention_roles);
        return data as EEWChannelData;
    }

    /**
     * 緊急地震速報を通知するチャンネルの全取得
     */
    public getAllEEWChannel(): Array<EEWChannelData> {
        const datas = this.sql.prepare('SELECT * FROM eew_channels;').all();
        for (const data of datas) {
            data.mention_roles = JSON.parse(data.mention_roles);
        }
        return this.sql.prepare('SELECT * FROM eew_channels;').all() as Array<EEWChannelData>;
    }

    /**
     * 緊急地震速報を通知するチャンネルを最小通知震度で絞り込んで取得
     */
    public getAllEEWChannel_Intensity(intensity: number): Array<EEWChannelData> {
        const datas = this.sql.prepare('SELECT * FROM eew_channels WHERE min_intensity <= ?;').all(intensity);
        for (const data of datas) {
            data.mention_roles = JSON.parse(data.mention_roles);
        }
        return datas as Array<EEWChannelData>;
    }

    /**
     * 緊急地震速報を通知するチャンネルを追加する
     */
    public addEEWChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>): void {
        if (this.getEEWChannel(channelId)) return;
        this.sql.prepare('INSERT INTO eew_channels VALUES (?, ?, ?);').run(channelId, minIntensity, JSON.stringify(mentionRoles));
    }

    /**
     * 緊急地震速報を通知するチャンネルを削除する
     */
    public removeEEWChannel(channelId: string): void {
        if (!this.getEEWChannel(channelId)) return;
        this.sql.prepare('DELETE FROM eew_channels WHERE channelid = ?;').run(channelId);
    }

    /**
     * 地震情報を通知するチャンネルを取得する
     */
    public getQuakeInfoChannel(channelId: string): QuakeInfoChannelData | null {
        const data = this.sql.prepare('SELECT * FROM quakeinfo_channels WHERE channelid = ?;').get(channelId);
        if (!data) return null;
        data.mention_roles = JSON.parse(data.mention_roles);
        return data as QuakeInfoChannelData;
    }

    /**
     * 地震情報を通知するチャンネルの全取得
     */
    public getAllQuakeInfoChannel(): Array<QuakeInfoChannelData> {
        const datas = this.sql.prepare('SELECT * FROM quakeinfo_channels;').all();
        for (const data of datas) {
            data.mention_roles = JSON.parse(data.mention_roles);
        }
        return datas as Array<QuakeInfoChannelData>;
    }

    /**
     * 地震情報を通知するチャンネルを最小通知震度で絞り込んで取得
     */
    public getAllQuakeInfo_Intensity(intensity: number): Array<QuakeInfoChannelData> {
        const datas = this.sql.prepare('SELECT * FROM quakeinfo_channels WHERE min_intensity <= ?;').all(intensity);
        for (const data of datas) {
            data.mention_roles = JSON.parse(data.mention_roles);
        }
        return datas as Array<QuakeInfoChannelData>;
    }

    /**
     * 地震情報を通知するチャンネルを追加する
     */
    public addQuakeInfoChannel(channelId: string, minIntensity: number, mentionRoles: Array<string>, image: number, relative: number): void {
        if (this.getQuakeInfoChannel(channelId)) return;
        this.sql.prepare('INSERT INTO quakeinfo_channels VALUES (?, ?, ?, ?, ?);').run(channelId, minIntensity, JSON.stringify(mentionRoles), image, relative);
    }

    /**
     * 地震情報を通知するチャンネルを削除する
     */
    public removeQuakeInfoChannel(channelId: string): void {
        if (!this.getQuakeInfoChannel(channelId)) return;
        this.sql.prepare('DELETE FROM quakeinfo_channels WHERE channelid = ?;').run(channelId);
    }
}