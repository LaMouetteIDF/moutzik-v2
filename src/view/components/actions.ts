import { MessageActionRow, MessageButton } from 'discord.js';
import { ButtonsDataState } from './constants';
import { ActionButtonState } from './types';

const MAX_NUMBER_COLUMN = 5;

export class ButtonComponents extends Array<MessageButton> {
  private actionsResponse: MessageActionRow[];
  private numberCol: number;

  constructor(numberCol = 5) {
    super();
    this.numberCol =
      numberCol > MAX_NUMBER_COLUMN || numberCol <= 0
        ? MAX_NUMBER_COLUMN
        : numberCol;

    ButtonsDataState.map((buttonData) => {
      const BUTTON_COMPONENT = new MessageButton();

      let state: ActionButtonState | undefined;

      if (buttonData.states.length == 1) {
        state = buttonData.states[0];
      } else {
        state = buttonData.states.filter((buttonData) => buttonData.default)[0];
        if (!state) state = buttonData.states[0];
      }
      if (state) {
        this.push(
          BUTTON_COMPONENT.setCustomId(buttonData.id)
            .setStyle(state.style)
            .setLabel(state.payload)
            .setDisabled(state.disable),
        );
      }
    });
    this.makeResponse();
  }

  get response() {
    return this.actionsResponse;
  }

  private makeResponse() {
    const rowComponentsWrapper: Array<MessageActionRow> = [];

    const buttonComponentsSize = this.length;

    const numberElementsCol = this.numberCol;

    const numberCompletRow = Math.floor(
      buttonComponentsSize / numberElementsCol,
    );

    for (let i = 0; i <= numberCompletRow; i++) {
      const start = i * numberElementsCol;
      if (!this[start]) break;

      const end =
        start + numberElementsCol > this.length
          ? this.length - 1
          : start + numberElementsCol - 1;

      const row = new MessageActionRow();

      for (let y = start; y <= end; y++) row.components.push(this[y]);

      rowComponentsWrapper.push(row);
    }

    this.actionsResponse = rowComponentsWrapper;
  }

  public setState(key: string, value: string) {
    try {
      const ButtonState = ButtonsDataState.find((item) => item.id == key);
      if (!ButtonState) throw new Error(`Button State "${key}" is not found`);

      const State = ButtonState.states.find((item) => item.id == value);
      if (!State)
        throw new Error(
          `State "${value}" in ButtonState "${key}" is not found`,
        );

      const ButtonAction = this.find((item) => item.customId == key);
      if (!ButtonAction) throw new Error(`Button Action "${key}" is not found`);

      ButtonAction.setLabel(State.payload);
      ButtonAction.setStyle(State.style);
      ButtonAction.setDisabled(State.disable);
    } catch (error) {
      console.error(error);
    }
  }

  public setNumberCol(numberCol = 5) {
    this.numberCol =
      numberCol > MAX_NUMBER_COLUMN || numberCol <= 0
        ? MAX_NUMBER_COLUMN
        : numberCol;
  }
}
