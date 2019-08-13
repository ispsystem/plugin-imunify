import { handleErrors } from '../../models/antivirus/actions';
import { Observable, BehaviorSubject } from 'rxjs';

/** Common interface for response result by fetch list */
export interface FetchListResult<T> {
  size: number;
  list: T[];
}

export abstract class AbstractStore<T> {
  private _state$: BehaviorSubject<T>;
  state$: Observable<T>;

  protected constructor(state: T) {
    this._state$ = new BehaviorSubject<T>(state);
    this.state$ = this._state$.asObservable();
  }

  get state(): T {
    return this._state$.getValue();
  }

  setState(nextState: T): void {
    this._state$.next(nextState);
  }
}

/** Common state for table with pagination */
export class TableState<T> {
  currentPage: number;
  countOnPage: number;
  elementCount: number;
  pageCount: number;
  data: T[];
  selectedList: number[];

  constructor(currentPage = 1, countOnPage = 10, selectedList = []) {
    this.currentPage = currentPage;
    this.countOnPage = countOnPage;
    this.selectedList = selectedList;
  }
}

export class TableStore<T> extends AbstractStore<TableState<T>> {
  constructor() {
    super(new TableState());
  }
}

/** Custom controller for table state by pagination */
export class PaginationController<T, U extends TableStore<T>> {
  /** Query for fetch list data */
  private _query: string;

  /** Ref for store */
  private _store: U;

  /** Handle for request failure */
  handleFailure: (error: any) => void;

  constructor(query: string, handleFailure: (error: any) => void, store: U) {
    this._query = query;
    this._store = store;
    this.handleFailure = handleFailure;
  }

  /**
   * Method for initialize table state
   */
  async init(): Promise<void> {
    await this._fetch();
  }

  /**
   * Handle click next page
   */
  onClickNext(): void {
    if (this._store.state.currentPage < this._store.state.pageCount) {
      this._store.state.currentPage++;
      this._fetch();
    }
  }

  /**
   * Handle previous page
   */
  onClickPrevious(): void {
    if (this._store.state.currentPage > 1) {
      this._store.state.currentPage--;
      this._fetch();
    }
  }

  /**
   * Handle change count on one page
   *
   * @param count - new count on page
   */
  onChangeCountOnPage(count: number): void {
    if (count !== this._store.state.countOnPage) {
      this._store.state.currentPage =
        Math.floor((this._store.state.currentPage * this._store.state.countOnPage - this._store.state.countOnPage) / count) + 1;
      this._store.state.countOnPage = count;
      this._fetch();
    }
  }

  /**
   * Method for get new table data
   */
  private async _fetch(): Promise<void> {
    try {
      const requestInit: RequestInit = {
        method: 'GET',
      };
      const response = await fetch(
        `${this._query}?limit=${this._store.state.countOnPage * this._store.state.currentPage - this._store.state.countOnPage},${
          this._store.state.countOnPage
        }`,
        requestInit,
      );
      handleErrors(response);
      const result: FetchListResult<T> = await response.json();
      // update state after fetch new data
      this._store.setState({
        ...this._store.state,
        elementCount: result.size,
        pageCount: Math.ceil(result.size / this._store.state.countOnPage),
        data: result.list,
      });
    } catch (error) {
      this.handleFailure(error);
    }
  }
}

export type GroupAction<K extends string> = {
  [k in K]: (ids: number[]) => Promise<void>;
};

export class GroupActionController<T, U extends TableStore<T>, K extends string> {
  /** List of group actions */
  private _actionList: GroupAction<K>;
  /** Ref for store */
  private _store: U;
  constructor(actionList: GroupAction<K>, store: U) {
    this._actionList = actionList;
    this._store = store;
  }

  select(id: number | number[]): void {
    const ids = Array.isArray(id) ? id : [id];
    this._store.setState({
      ...this._store.state,
      selectedList: [...this._store.state.selectedList, ...ids],
    });
  }

  deselect(id: number | number[]): void {
    const ids = Array.isArray(id) ? id : [id];
    this._store.setState({
      ...this._store.state,
      selectedList: [...this._store.state.selectedList.filter(i => !ids.includes(i))],
    });
  }

  async doAction(actionName: K): Promise<void> {
    await this._actionList[actionName](this._store.state.selectedList);
  }
}
