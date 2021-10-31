import { Module } from '@nestjs/common';

// Internal import
import { PlayerModule } from 'src/player/player.module';
import { InteractionsService } from './interactions.service';

// COMMANDS  import
import ConfigCommand from './commands/config';
import PlayCommand from './commands/play';
import AddCommand from './commands/add';
import RemoveCommand from './commands/remove';
import StopCommand from './commands/stop';
import ListCommand from './commands/list';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [PlayerModule, ConfigModule],
  providers: [
    InteractionsService,
    {
      provide: 'COMMANDS',
      useValue: [
        ConfigCommand,
        PlayCommand,
        AddCommand,
        RemoveCommand,
        StopCommand,
        ListCommand,
      ],
    },
  ],
})
export class InteractionsModule {}
