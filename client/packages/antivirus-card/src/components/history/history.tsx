import { Component, h, Prop, State } from '@stencil/core';
import { Store } from '@stencil/redux';

import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { getDayMonthYearAsStr, getTimeAsStr } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { HistoryItem, AntivirusState } from '../../models/antivirus/state';
import { endpoint } from '../../constants';
import { TableController, TableState, TableStore } from '../table/table-controller';
import { Subscription } from 'rxjs';
import { AntivirusActions } from '../../models/antivirus/actions';
import { AntivirusCardPages } from '../../models/antivirus/model';

@Component({
  tag: 'antivirus-card-history',
  styleUrl: 'styles/$.scss',
})
export class History {
  /** RXJS subscription */
  sub = new Subscription();

  /** table store */
  tableStore: TableStore<HistoryItem>;

  /** Table controller */
  paginationController: TableController.Pagination<HistoryItem, TableStore<HistoryItem>>;

  /** Ref to main component */
  cardElement: HTMLAntivirusCardElement;

  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** Vepp site id */
  @State() siteId: RootState['siteId'];

  /** translate object */
  @State() t: ITranslate;

  /** Common table state */
  @State() tableState: TableState<HistoryItem>;

  /** flag if antivirus is pro version */
  @State() isProVersion: AntivirusState['isProVersion'];

  /** Scan in process */
  @State() scanning: AntivirusState['scanning'];

  /** Action scan */
  scanVirus: typeof AntivirusActions['scan'];

  constructor() {
    this.tableStore = new TableStore();
  }
  async componentWillLoad() {
    this.cardElement = document.querySelector('antivirus-card');
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate, siteId: state.siteId }));
    this.store.mapDispatchToProps(this, {
      scanVirus: AntivirusActions.scan,
    });

    this.paginationController = new TableController.Pagination(
      `${endpoint}/plugin/api/imunify/site/${this.siteId}/scan/history`,
      this.handleFailure,
      this.tableStore,
    );

    // subscribe to update state by table controller
    this.sub.add(
      this.tableStore.state$.subscribe({
        next: newState => (this.tableState = newState),
      }),
    );

    // initialize data by controller
    await this.paginationController.reFetch();
  }

  componentDidUnload() {
    this.sub.unsubscribe();
  }

  /**
   * Handle fetch list error
   * @todo may be need update global state with error
   *
   * @param error - error
   */
  handleFailure(error: any): void {
    throw new Error("Oops, we haven't got JSON with a history list!" + error);
  }

  /**
   * Handle retry scan by history and redirect to dashboard
   *
   * @param item - history item
   */
  async handleRetryScan(item: HistoryItem) {
    await Promise.all([
      this.scanVirus(item.scanOptionId, item.checkType, this.siteId),
      this.cardElement.changeActiveItem(AntivirusCardPages.dashboard),
    ]);
  }

  render() {
    return (
      <antivirus-card-table>
        <div slot="table-header" style={{ display: 'contents' }}>
          <antivirus-card-table-row style={{ height: '50px', 'vertical-align': 'middle' }}>
            <antivirus-card-table-cell style={{ width: 220 - 40 + 'px' }}>
              {this.t.msg(['HISTORY_TAB', 'TABLE_HEADER', 'CELL_1'])}
            </antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 200 - 20 + 'px' }}>
              {this.t.msg(['HISTORY_TAB', 'TABLE_HEADER', 'CELL_2'])}
            </antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 547 - 20 + 'px' }}>
              {this.t.msg(['HISTORY_TAB', 'TABLE_HEADER', 'CELL_3'])}
            </antivirus-card-table-cell>
            {this.isProVersion && <antivirus-card-table-cell style={{ width: 70 + 'px' }}></antivirus-card-table-cell>}
          </antivirus-card-table-row>
        </div>
        <div slot="table-body" style={{ display: 'contents' }}>
          {this.tableState.data.map(historyItem => (
            <antivirus-card-table-row action-hover>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{getDayMonthYearAsStr(new Date(historyItem.date))}</span>
                <span class="add-text">{getTimeAsStr(new Date(historyItem.date))}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="isp-table-cell__main-text">{this.t.msg(['HISTORY_TAB', 'CHECK_TYPE', historyItem.checkType])}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="isp-table-cell__main-text">{historyItem.infectedFilesCount}</span>
                {this.isProVersion && historyItem.curedFilesCount > 0 && (
                  <span class="add-text" style={{ color: '#30ba9a', 'margin-top': '5px' }}>
                    {this.t.msg(['HISTORY_TAB', 'CURED_COUNT'], { count: historyItem.curedFilesCount }).toLowerCase()}
                  </span>
                )}
              </antivirus-card-table-cell>
              {this.isProVersion && (
                <antivirus-card-table-cell style={{ 'text-align': 'right' }} doubleline>
                  <a
                    class={`link${this.scanning ? ' disabled' : ''}`}
                    onClick={async ev => (this.scanning ? ev.preventDefault() : await this.handleRetryScan(historyItem))}
                  >
                    {this.t.msg(['HISTORY_TAB', 'ACTION', 'RETRY'])}
                  </a>
                </antivirus-card-table-cell>
              )}
            </antivirus-card-table-row>
          ))}
        </div>
        <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>{this.t.msg(['TABLE', 'RECORD_COUNT'], { smart_count: this.tableState.elementCount })}</span>
            <antivirus-card-table-pagination
              countOnPage={this.tableState.countOnPage}
              pageCount={this.tableState.pageCount}
              currentPage={this.tableState.currentPage}
              changeCountOnPage={value => this.paginationController.onChangeCountOnPage(value)}
              clickPagination={event =>
                event === 'next' ? this.paginationController.onClickNext() : this.paginationController.onClickPrevious()
              }
            />
          </div>
        </div>
      </antivirus-card-table>
    );
  }
}
