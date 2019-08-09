import { Observable, BehaviorSubject } from 'rxjs';
import { TaskEventName } from './types';

export interface TaskElement {
  name: TaskEventName;
  status: string;
  id: number;
}

export abstract class AbstractStore<T> {
  private _state$: BehaviorSubject<T>;
  private _taskList$ = new BehaviorSubject<TaskElement[]>([]);
  taskList$: Observable<TaskElement[]>;
  state$: Observable<T>;

  protected constructor(state: T) {
    this._state$ = new BehaviorSubject<T>(state);
    this.state$ = this._state$.asObservable();
    this.taskList$ = this._taskList$.asObservable();
  }

  get state(): T {
    return { ...this._state$.getValue(), taskList: this.taskList };
  }

  get taskList(): TaskElement[] {
    return this._taskList$.getValue();
  }

  setState(nextState: T): void {
    this._state$.next(nextState);
  }

  setTaskList(nextList: TaskElement[]): void {
    this._taskList$.next(nextList);
  }
}
