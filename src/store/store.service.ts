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

@Injectable()
export class StoreService implements OnApplicationBootstrap {
  private guilds = new Map<string, GuildItem>();

  constructor(
    @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async onApplicationBootstrap() {
    const guildDatas = await this.guildModel.find().exec();
    for (const guildData of guildDatas) {
      this.guilds.set(guildData.guildId, guildData);
    }

    // console.log(guildDatas);

    // Emit End FAKE
    // A CHANGER !!!!!!!!!!!!!!!
    this.eventEmitter.emit('player.ready');
  }

  getAll() {
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

  async setConfigOption<K extends keyof GuildConfigItem>(
    guildId: string,
    option: K,
    value: GuildConfigItem[K],
  ) {
    const select = `config.${option}`;
    const i = {};
    i[select] = value;

    await this.guildModel.updateOne({ guildId }, { $set: i }).exec();
  }
}
