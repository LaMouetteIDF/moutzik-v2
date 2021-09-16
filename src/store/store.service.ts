import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guild, GuildDocument } from './schemas/guild.schema';

@Injectable()
export class StoreService implements OnApplicationBootstrap {
  private guilds = new Map<string, GuildDocument>();

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

  async newItem(guildId: string, channelId: string) {
    const guildItem = new Guild();

    guildItem.guildId = guildId;
    guildItem.config.playerChannel = channelId;

    return await new this.guildModel(guildItem).save();
  }

  get;
}
