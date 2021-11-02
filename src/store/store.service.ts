import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Guild, GuildDocument } from './schemas/guild.schema';
import type { GuildConfigItem, GuildItem } from './type';
import { plainToClass } from 'class-transformer';
import { Playlist } from './schemas/playlist.schema';
import { Snowflake } from 'discord.js';
import { Playlists } from './schemas/playlists.schema';

@Injectable()
export class StoreService implements OnApplicationBootstrap {
  private guilds = new Map<string, GuildItem>();
  private _itemsAreAlreadyFetch = false;

  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    // const guildDatas = await this.guildModel.find().exec();
    // for (const guildData of guildDatas) {
    //   guildData.playlist = plainToClass(Playlist, guildData.playlist);
    //   this.guilds.set(guildData.guildId, guildData);
    // }
    // setInterval(async () => {
    //   for (const item of this.guilds.values()) {
    //     item.markModified('playlist.index');
    //     item.markModified('playlist.repeat');
    //     await item.save();
    //   }
    // }, 1_000 * 60 * 5);
    // // Emit End FAKE
    // // A CHANGER !!!!!!!!!!!!!!!
    // this.eventEmitter.emit('store.ready');
  }

  private async _fetchAllItems() {
    if (this._itemsAreAlreadyFetch) return;
    const guildDatas = await this.guildModel.find().exec();
    for (const guildData of guildDatas) {
      guildData.playlists = plainToClass(Playlists, guildData.playlists);

      console.log(guildData.playlists.list[0].getAllTracks);
      this.guilds.set(guildData.guildId, guildData);
    }

    setInterval(async () => {
      for (const item of this.guilds.values()) {
        item.markModified('playlists');
        await item.save();
      }
    }, 1_000 * 60 * 5);

    this._itemsAreAlreadyFetch = true;
  }

  async getAll() {
    await this._fetchAllItems();
    return this.guilds.values();
  }

  async newItem(guildId: string, textChannelId: string) {
    if (this.guilds.has(guildId)) {
      return this.guilds.get(guildId);
    }

    const guildItem = new Guild();

    guildItem.guildId = guildId;
    guildItem.config.playerChannel = textChannelId;

    const guildSave = await new this.guildModel(guildItem).save();
    this.guilds.set(guildId, guildSave);

    return this.guilds.get(guildId);
  }

  get(key: string): GuildItem | null {
    return this.guilds.get(key);
  }

  has(guildId: Snowflake): boolean {
    return this.guilds.has(guildId);
  }

  async setConfigOption<K extends keyof GuildConfigItem>(
    guildId: string,
    option: K,
    value: GuildConfigItem[K],
  ) {
    const select = `config.${option}`;
    const jsonUpdate = {};
    jsonUpdate[select] = value;

    await this.guildModel.updateOne({ guildId }, { $set: jsonUpdate }).exec();
  }
}
