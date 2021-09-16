import { Module } from '@nestjs/common';

// Internal import
import { PlayerModule } from 'src/player/player.module';
import { InteractionsService } from './interactions.service';

// COMMANDS  import
import ConfigCommand from './commands/config';

@Module({
  imports: [PlayerModule],
  providers: [
    InteractionsService,
    {
      provide: 'COMMANDS',
      useValue: [ConfigCommand],
    },
  ],
})
export class InteractionsModule {}
