import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Abstract class for realise store pattern
 */
export abstract class AbstractStore<T> {
  /** State as behavior subject */
  private _state$: BehaviorSubject<T>;
  /** Observable for state */
  state$: Observable<T>;

  protected constructor(state: T) {
    this._state$ = new BehaviorSubject<T>(state);
    this.state$ = this._state$.asObservable();
  }

  /**
   * Method return current state
   */
  get state(): T {
    return this._state$.getValue();
  }

  /**
   * Method for update state
   *
   * @param nextState - next state value
   */
  setState(nextState: T): void {
    this._state$.next(nextState);
  }
}
