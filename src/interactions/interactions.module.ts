import { Module } from '@nestjs/common';

// Internal import
import { PlayerModule } from 'src/player/player.module';
import { InteractionsService } from './interactions.service';

// COMMANDS  import
import ConfigCommand from './commands/config';
import PlayCommand from './commands/play';
import StopCommand from './commands/stop';
import ListCommand from './commands/list';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [PlayerModule, ConfigModule],
  providers: [
    InteractionsService,
    {
      provide: 'COMMANDS',
      useValue: [ConfigCommand, PlayCommand, ListCommand, StopCommand],
    },
    {
      provide: 'CONFI_COMMAND',
      useValue: [ConfigCommand],
    },
  ],
  exports: [InteractionsService],
})
export class InteractionsModule {}
