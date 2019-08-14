import { Component, h, Host, Event, EventEmitter, State, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { getDayMonthYearAsStr, getTimeAsStr } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { TableState, TableController } from '../table/table-controller';
import { Subscription } from 'rxjs';
import { endpoint } from '../../constants';
import { AntivirusState, InfectedFile } from '../../models/antivirus/state';
import { BurgerMenuIcon } from '../icons/burgerMenu';
import { AntivirusActions } from '../../models/antivirus/actions';

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

  /** Ref for dropdown element */
  dropdownEl!: HTMLAntivirusCardDropdownElement;
  /** Reference to delete files action */
  deleteFiles: typeof AntivirusActions.deleteFiles;
  /** Ref for deletion confirm modal */
  deletionModal!: HTMLAntivirusCardModalElement;

  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;

  /** user notification's provider */
  @State() userNotification: RootState['userNotification'];

  /** Vepp site id */
  @State() siteId: RootState['siteId'];

  /** Common table state */
  @State() tableState: TableState<InfectedFile>;

  /** Chosen file to apply an action to */
  @State() chosenFile: InfectedFile;

  /** Event for open modal window with buy pro version */
  @Event() openBuyModal: EventEmitter;

  constructor() {
    this.tableState = new TableState();
  }

  async componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate, siteId: state.siteId }));
    this.store.mapDispatchToProps(this, {
      deleteFiles: AntivirusActions.deleteFiles,
    });
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

  /**
   * Opens up the chosen file's path in the site's file manager
   * @TODO: It would be great if we could also **highlight** the file instead of just opening its folder
   */
  showInFileManager(): void {
    const { path } = this.chosenFile;
    let targetPath = path === '/' ? '' : '/' + encodeURIComponent(path);
    location.assign(`#/site/${this.siteId}/settings/files${targetPath}`);
  }

  render() {
    return (
      <Host>
        {(this.tableState.data && this.tableState.data.length) > 0 ? this.renderInfectedFilesTable() : this.renderEmptyListPlaceholder()}
      </Host>
    );
  }

  /**
   * Renders the placeholder with a text instead of table with empty files list
   */
  renderEmptyListPlaceholder = () => {
    return this.isProVersion ? (
      <div style={{ display: 'contents' }}>
        <p class="stub-text">{this.t.msg(['INFECTED_FILES', 'NOT_FOUND_PRO'])}</p>
      </div>
    ) : (
      <div style={{ display: 'contents' }}>
        <p class="stub-text">{this.t.msg(['INFECTED_FILES', 'NOT_FOUND'])}</p>

        <antivirus-card-button onClick={() => this.openBuyModal.emit()} btn-theme="accent">
          {this.t.msg(['INFECTED_FILES', 'SUBSCRIBE_TO_PRO'])}
        </antivirus-card-button>
      </div>
    );
  };

  /**
   * Opens up the delete confirm dialog modal
   * @param ev Mouse event of clicking the 'delete' link in the dropdown
   */
  async openDeletionModal(ev: MouseEvent) {
    await this.deletionModal.toggle(true);
    await this.dropdownEl.toggle(ev);
    return true;
  }

  /**
   * Handles delete modal submit button
   * @param files Files to delete
   */
  private deleteSubmitHandler(files: InfectedFile[]): void {
    this.deleteFiles(this.siteId, files, this.userNotification, this.t);
    this.deletionModal.toggle(false);
  }

  renderInfectedFilesTable = () => {
    return [
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
            <antivirus-card-table-cell style={{ width: 35 + 'px' }} />
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
              <antivirus-card-table-cell doubleline>
                <span class="main-text">
                  <span class="menu-icon" onClick={(ev: MouseEvent) => ((this.chosenFile = file), this.dropdownEl.toggle(ev))}>
                    <BurgerMenuIcon />
                  </span>
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
      </antivirus-card-table>,
      <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => (this.dropdownEl = el)}>
        <antivirus-card-vmenu>
          <antivirus-card-vmenu-item>{this.t.msg(['INFECTED_FILES', 'ACTIONS', 'HEAL'])}</antivirus-card-vmenu-item>
          {/*<antivirus-card-vmenu-item>{this.t.msg(['INFECTED_FILES', 'ACTIONS', 'EXCLUDE'])}</antivirus-card-vmenu-item>*/}
          <antivirus-card-vmenu-item style={{ marginBottom: '30px' }} onClick={() => this.showInFileManager()}>
            {this.t.msg(['INFECTED_FILES', 'ACTIONS', 'OPEN_FOLDER'])}
          </antivirus-card-vmenu-item>
          <antivirus-card-vmenu-item onClick={ev => this.openDeletionModal(ev)}>
            {this.t.msg(['INFECTED_FILES', 'ACTIONS', 'DELETE'])}
          </antivirus-card-vmenu-item>
        </antivirus-card-vmenu>
      </antivirus-card-dropdown>,
      <antivirus-card-modal ref={el => (this.deletionModal = el)} max-modal-width="530px">
        <span class="title">
          <span class="delete-modal-title">
            {this.t.msg(['INFECTED_FILES', 'MODAL', 'TITLE'], { filename: this.chosenFile && this.chosenFile.name })}
          </span>
          ?
        </span>
        <div class="flex-container" style={{ marginTop: 30 + 'px' }}>
          <antivirus-card-button onClick={() => this.deleteSubmitHandler([this.chosenFile])}>
            {this.t.msg(['INFECTED_FILES', 'MODAL', 'DELETE_BUTTON'])}
          </antivirus-card-button>
          <a class="link link_indent-left" onClick={() => this.deletionModal.toggle(false)}>
            {this.t.msg(['INFECTED_FILES', 'MODAL', 'CANCEL_BUTTON'])}
          </a>
        </div>
      </antivirus-card-modal>,
    ];
  };
}
