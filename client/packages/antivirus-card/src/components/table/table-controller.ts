import { handleErrors } from '../../models/antivirus/actions';
import { AbstractStore } from '../../utils/abstract.store';

/** Common interface for response result by fetch list */
export interface FetchListResult<T> {
  size: number;
  list: T[];
}

/** Type for group action */
export type GroupActionType<K extends string> = {
  [k in K]: (ids: number[]) => Promise<void>;
};

/** Common state for table with pagination */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TableState<T = any> {
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

export namespace TableController {
  /** Custom controller for table state by pagination */
  export class Pagination<T, U extends TableStore<T>> {
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
    async reFetch(): Promise<void> {
      await this._fetch();
      this._store.setStateProperty({
        selectedList: [],
      });
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
        this._store.setStateProperty({
          elementCount: result.size,
          pageCount: Math.ceil(result.size / this._store.state.countOnPage),
          data: result.list,
        });
      } catch (error) {
        this.handleFailure(error);
      }
    }
  }

  /**
   * Controller for state by group action
   */
  export class GroupAction<T, U extends TableStore<T>, K extends string> {
    /** List of group actions */
    private _actionList: GroupActionType<K>;
    /** Ref for store */
    private _store: U;
    constructor(actionList: GroupActionType<K>, store: U) {
      this._actionList = actionList;
      this._store = store;
    }

    /**
     * Method for select entity
     *
     * @param id - id entity
     */
    select(id: number | number[]): void {
      const ids = Array.isArray(id) ? id : [id];
      this._store.setStateProperty({
        selectedList: [...ids, ...this._store.state.selectedList.filter(id => !~ids.indexOf(id))],
      });
    }

    /**
     * Method for deselect entity
     *
     * @param id - id entity
     */
    deselect(id: number | number[]): void {
      const ids = Array.isArray(id) ? id : [id];
      this._store.setStateProperty({
        selectedList: [...this._store.state.selectedList.filter(i => !ids.includes(i))],
      });
    }

    /**
     * Method for performing a group action
     *
     * @param actionName - group action name
     */
    async doAction(actionName: K): Promise<void> {
      const idList = this._store.state.selectedList;
      await this._actionList[actionName](idList);
    }
  }
}
