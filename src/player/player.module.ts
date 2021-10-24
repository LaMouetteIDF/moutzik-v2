import { Global, Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { TrackService } from './track.service';

@Global()
@Module({
  providers: [PlayerService, TrackService],
  exports: [PlayerService],
})
export class PlayerModule {}
