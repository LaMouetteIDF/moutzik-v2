export enum RepeatState {
  NONE,
  ALL,
  ONE,
}

export enum PlayingState {
  PLAY,
  PAUSE,
  STOP,
}

export function sleep(time: number) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise<void>((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
