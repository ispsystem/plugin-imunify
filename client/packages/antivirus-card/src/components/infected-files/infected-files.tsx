import { Component, h, Host, Event, EventEmitter, State, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { getDayMonthYearAsStr, getTimeAsStr } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { InfectedFile } from '../../models/antivirus/state';
import { TableState, TableController } from '../table/table-controller';
import { Subscription } from 'rxjs';
import { endpoint } from '../../constants';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss',
})
export class InfectedFiles {
  /** RXJS subscription */
  sub = new Subscription();

  /** Table controller */
  tableController: TableController<InfectedFile>;

  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** translate object */
  @State() t: ITranslate;

  /** Vepp site id */
  @State() siteId: RootState['siteId'];

  /** Common table state */
  @State() tableState: TableState<InfectedFile>;

  /** Event for open modal window with buy pro version */
  @Event() openBuyModal: EventEmitter;

  constructor() {
    this.tableState = new TableState();
  }

  async componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ t: state.translate, siteId: state.siteId }));
    this.tableController = new TableController(
      `${endpoint}/plugin/api/imunify/site/${this.siteId}/files/infected`,
      this.handleFailure,
      this.tableState,
    );

    // subscribe to update state by table controller
    this.sub.add(
      this.tableController.state$.subscribe({
        next: newState => (this.tableState = newState),
      }),
    );

    // initialize data by controller
    await this.tableController.init();
  }

  /**
   * Handle fetch list error
   * @todo may be need update global state with error
   *
   * @param error - error
   */
  handleFailure(error: any): void {
    throw new Error("Oops, we haven't got JSON with a infected file list!" + error);
  }

  render() {
    return (
      <Host>
        {this.tableState.data && this.tableState.elementCount > 0 ? (
          this.renderInfectedFilesTable()
        ) : (
          <div style={{ display: 'contents' }}>
            <p class="stub-text">{this.t.msg(['INFECTED_FILES', 'NOT_FOUND'])}</p>

            <antivirus-card-button onClick={() => this.openBuyModal.emit()} btn-theme="accent">
              {this.t.msg(['INFECTED_FILES', 'SUBSCRIBE_TO_PRO'])}
            </antivirus-card-button>
          </div>
        )}
      </Host>
    );
  }

  renderInfectedFilesTable = () => {
    return (
      <antivirus-card-table>
        <div slot="table-header" style={{ display: 'contents' }}>
          <antivirus-card-table-row style={{ height: '50px', 'vertical-align': 'middle' }}>
            <antivirus-card-table-cell style={{ width: 250 - 40 + 'px' }}>
              {this.t.msg(['INFECTED_FILES', 'TABLE_HEADER', 'CELL_1'])}
            </antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 130 - 20 + 'px' }}>
              {this.t.msg(['INFECTED_FILES', 'TABLE_HEADER', 'CELL_2'])}
            </antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 130 - 20 + 'px' }}>
              {this.t.msg(['INFECTED_FILES', 'TABLE_HEADER', 'CELL_3'])}
            </antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 370 - 20 + 'px' }}>
              {this.t.msg(['INFECTED_FILES', 'TABLE_HEADER', 'CELL_4'])}
            </antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        <div slot="table-body" style={{ display: 'contents' }}>
          {this.tableState.data.map(file => (
            <antivirus-card-table-row action-hover>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{file.name}</span>
                <span class="add-text">{this.t.msg(['INFECTED_FILES', 'STATUS', file.status])}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text main-text__ellipsis">{file.threatName}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{getDayMonthYearAsStr(new Date(file.detectionDate))}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{file.path}</span>
                <span class="add-text">
                  {file.lastChangeDate
                    ? this.t.msg(['DATETIME_CHANGED'], {
                        date: getDayMonthYearAsStr(new Date(file.lastChangeDate)),
                        time: getTimeAsStr(new Date(file.lastChangeDate)),
                      })
                    : this.t.msg(['DATETIME_CREATED'], {
                        date: getDayMonthYearAsStr(new Date(file.createdDate)),
                        time: getTimeAsStr(new Date(file.createdDate)),
                      })}
                </span>
              </antivirus-card-table-cell>
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
              changeCountOnPage={value => this.tableController.onChangeCountOnPage(value)}
              clickPagination={event => (event === 'next' ? this.tableController.onClickNext() : this.tableController.onClickPrevious())}
            />
          </div>
        </div>
      </antivirus-card-table>
    );
  };
}
