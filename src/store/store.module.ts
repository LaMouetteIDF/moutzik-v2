import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './schemas/guild.schema';
import { StoreService } from './store.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]),
  ],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
