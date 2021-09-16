import { Global, Module } from '@nestjs/common';
import { ClientOptions, Intents } from 'discord.js';
import { ClientService } from './client.service';

const CLIENT_OPTIONS: ClientOptions = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
};
@Global()
@Module({
  providers: [
    { provide: 'CLIENT_OPTIONS', useValue: CLIENT_OPTIONS },
    ClientService,
  ],
  exports: [ClientService],
})
export class ClientModule {}
