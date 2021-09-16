import { Prop, Schema } from '@nestjs/mongoose';
import { RepeatState } from 'src/utils';

@Schema()
export class PlayerOptions {
  @Prop()
  repeat: RepeatState;

  @Prop()
  volume: number;

  constructor() {
    this.repeat = RepeatState.NONE;
    this.volume = 0.5;
  }
}
