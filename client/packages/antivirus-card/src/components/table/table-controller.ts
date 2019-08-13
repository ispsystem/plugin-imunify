import { handleErrors } from '../../models/antivirus/actions';
import { Observable, BehaviorSubject } from 'rxjs';

/** Common interface for response result by fetch list */
export interface FetchListResult<T> {
  size: number;
  list: T[];
}

/** Common state for table with pagination */
export class TableState<T> {
  currentPage: number;
  countOnPage: number;
  elementCount: number = null;
  pageCount: number = null;
  data: T[];

  constructor(currentPage = 1, countOnPage = 10) {
    this.currentPage = currentPage;
    this.countOnPage = countOnPage;
  }
}

/** Custom controller for table state by pagination */
export class TableController<T> {
  /** Query for fetch list data */
  private _query: string;

  /** Table state */
  private _state$: BehaviorSubject<TableState<T>>;

  /** Table state as observable */
  state$: Observable<TableState<T>>;

  /** Handle for request failure */
  handleFailure: (error: any) => void;

  constructor(query: string, handleFailure: (error: any) => void, state: TableState<T>) {
    this._query = query;
    this._state$ = new BehaviorSubject(state);
    this.state$ = this._state$.asObservable();
    this.handleFailure = handleFailure;
  }

  private get _state(): TableState<T> {
    return this._state$.getValue();
  }

  private set _state(nextState: TableState<T>) {
    this._state$.next(nextState);
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
    if (this._state.currentPage < this._state.pageCount) {
      this._state.currentPage++;
      this._fetch();
    }
  }

  /**
   * Handle previous page
   */
  onClickPrevious(): void {
    if (this._state.currentPage > 1) {
      this._state.currentPage--;
      this._fetch();
    }
  }

  /**
   * Handle change count on one page
   *
   * @param count - new count on page
   */
  onChangeCountOnPage(count: number): void {
    if (count !== this._state.countOnPage) {
      this._state.currentPage = Math.floor((this._state.currentPage * this._state.countOnPage - this._state.countOnPage) / count) + 1;
      this._state.countOnPage = count;
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
        `${this._query}?limit=${this._state.countOnPage * this._state.currentPage - this._state.countOnPage},${this._state.countOnPage}`,
        requestInit,
      );
      handleErrors(response);
      const result: FetchListResult<T> = await response.json();

      // update state after fetch new data
      this._state = {
        ...this._state,
        elementCount: result.size,
        pageCount: Math.ceil(result.size / this._state.countOnPage),
        data: result.list,
      };
    } catch (error) {
      this.handleFailure(error);
    }
  }
}
