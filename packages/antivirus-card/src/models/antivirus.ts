import { observable } from 'mobx';

/**
 * Singleton. AntivirusModel service
 */
export class AntivirusModel {
  @observable isFreeVersion = true;
  @observable catScheduledActions = false;
  // private static instance;

  // /**
  //  * Return the instance from the singleton class
  //  */
  // constructor() {
  //   if (AntivirusModel.instance) {
  //     return AntivirusModel.instance;
  //   }
  //   AntivirusModel.instance = this;
  // }
}
