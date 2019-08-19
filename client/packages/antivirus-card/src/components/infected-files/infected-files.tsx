import { Component, h, Host, Event, EventEmitter, State, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState, NotifierEvent } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { getDayMonthYearAsStr, getTimeAsStr, getNestedObject } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { TableState, TableController, TableStore } from '../table/table-controller';
import { Subscription } from 'rxjs';
import { endpoint } from '../../constants';
import { AntivirusState, InfectedFile } from '../../models/antivirus/state';
import { BurgerMenuIcon } from '../icons/burgerMenu';
import { TableGroupActions } from '../table-actions/TableGroupActions';
import { AntivirusActions } from '../../models/antivirus/actions';
import { TaskEventName } from '../../models/antivirus/model';

type InfectedFilesAction = 'delete' | 'heal';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss',
})
export class InfectedFiles {
  /** RXJS subscription */
  sub = new Subscription();

  /** Table store */
  tableStore: TableStore<InfectedFile>;

  /** Pagination controller */
  paginationController: TableController.Pagination<InfectedFile, TableStore<InfectedFile>>;

  /** Group action controller */
  groupActionController: TableController.GroupAction<InfectedFile, TableStore<InfectedFile>, InfectedFilesAction>;

  /** Global store */
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;

  /** Ref for dropdown element */
  dropdownEl!: HTMLAntivirusCardDropdownElement;
  /** Reference to delete files action */
  deleteFiles: typeof AntivirusActions.deleteFiles;
  /** Reference to delete files action */
  cureFiles: typeof AntivirusActions.cureFiles;
  /** Ref for deletion confirm modal */
  deletionModal!: HTMLAntivirusCardModalElement;

  /** Flag for pro version ImunifyAV */
  @State() isProVersion: AntivirusState['isProVersion'];

  /** translate object */
  @State() t: ITranslate;

  /** Global notifier object */
  @State() notifier: RootState['notifier'];

  /** user notification's provider */
  @State() userNotification: RootState['userNotification'];

  /** Vepp site id */
  @State() siteId: RootState['siteId'];

  /** Common table state */
  @State() tableState: TableState<InfectedFile>;

  /** Chosen file to apply an action to */
  @State() chosenFiles: InfectedFile[];

  /** Event for open modal window with buy pro version */
  @Event() openBuyModal: EventEmitter;

  constructor() {
    this.tableStore = new TableStore();
  }

  async componentWillLoad() {
    this.store.mapStateToProps(this, state => ({
      ...state.antivirus,
      t: state.translate,
      siteId: state.siteId,
      userNotification: state.userNotification,
      notifier: state.notifier,
    }));
    this.store.mapDispatchToProps(this, {
      deleteFiles: AntivirusActions.deleteFiles,
      cureFiles: AntivirusActions.cureFiles,
    });

    // controlling table state by pagination
    this.paginationController = new TableController.Pagination(
      `${endpoint}/plugin/api/imunify/site/${this.siteId}/files/infected`,
      this.handleFailure,
      this.tableStore,
    );
    // controlling table state by group actions
    this.groupActionController = new TableController.GroupAction(
      {
        delete: this.delete.bind(this),
        heal: this.heal.bind(this),
      },
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

    // update state by notify
    if (Boolean(this.notifier)) {
      this.sub.add(
        this.notifier.delete$().subscribe({
          next: async (notify: { event: NotifierEvent }) => {
            const taskName = getNestedObject(notify.event, ['additional_data', 'name']);
            if (taskName !== undefined && (taskName === TaskEventName.filesDelete || taskName === TaskEventName.filesCure)) {
              this.paginationController.reFetch();
            }
          },
        }),
      );
    }
  }

  /**
   * Lifecycle hook, unsubscribe when component remove
   */
  componentDidUnload() {
    this.sub.unsubscribe();
  }

  /**
   * Group action delete files
   *
   * @param files - files to delete
   */
  async delete(files: InfectedFile[]) {
    this.chosenFiles = this.tableState.selectedList.filter(file => files.includes(file));
    this.openDeletionModal();
  }

  /**
   * Group action heal files
   *
   * @param files - files to cure
   */
  async heal(files: InfectedFile[]) {
    await this.cureSubmitHandler(this.tableState.selectedList.filter(file => files.includes(file)));
  }

  /**
   * Handle fetch list error
   * @todo may be need update global state with error
   *
   * @param error - error
   */
  handleFailure(error: any): void {
    /** @todo add handle for error fetch list */
    throw new Error("Oops, we haven't got JSON with a infected file list!" + error);
  }

  /**
   * Opens up the delete confirm dialog modal
   * @param ev Mouse event of clicking the 'delete' link in the dropdown
   */
  async openDeletionModal(ev?: MouseEvent): Promise<boolean> {
    await this.deletionModal.toggle(true);
    if (Boolean(ev)) {
      await this.dropdownEl.toggle(ev);
    }
    return true;
  }

  /**
   * Handles delete modal submit button
   * @param files - File's
   */
  async deleteSubmitHandler(files: InfectedFile[]): Promise<void> {
    this.deletionModal.toggle(false);
    const fileIds = files.map(f => f.id);
    await this.deleteFiles(this.siteId, files, this.userNotification, this.t);
    this.tableStore.setStateProperty({
      data: this.tableState.data.map(file => {
        if (fileIds.includes(file.id)) {
          file.status = 'DELETED';
        }
        return file;
      }),
      selectedList: [],
    });
  }

  /**
   * Handles cure files
   * @param files - File's
   * @param event - DOM event
   */
  async cureSubmitHandler(files: InfectedFile[], event?: Event): Promise<void> {
    if (Boolean(event)) {
      this.dropdownEl.toggle(event);
    }
    if (this.isProVersion) {
      const fileIds = files.map(f => f.id);
      await this.cureFiles(this.siteId, files, this.userNotification, this.t);
      this.tableStore.setStateProperty({
        data: this.tableState.data.map(file => {
          if (fileIds.includes(file.id)) {
            file.status = 'HEALING';
          }
          return file;
        }),
        selectedList: [],
      });
    } else {
      this.openBuyModal.emit();
    }
  }

  /**
   * Opens up the chosen file's path in the site's file manager
   * @TODO: It would be great if we could also **highlight** the file instead of just opening its folder
   */
  showInFileManager(): void {
    const { path } = this.chosenFiles[0];
    const targetPath = path === '/' ? '' : '/' + encodeURIComponent(path);
    location.assign(`#/site/${this.siteId}/settings/files${targetPath}`);
  }

  /**
   * Handles file's action menu button
   * If the file is deleted this method doesnt remembers the chosen file and doesnt toggle the dropdown
   * @param ev MouseEvent
   * @param file Menu's file
   */
  handleBurgerMenuClick(ev: MouseEvent, file: InfectedFile) {
    if (file.status === 'DELETED') {
      ev.preventDefault();
      return;
    }

    this.chosenFiles = [file];
    this.dropdownEl.toggle(ev);
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
            <antivirus-card-table-cell style={{ width: 15 + 'px' }}>
              <antivirus-card-checkbox
                onChanged={event => {
                  event.detail
                    ? this.groupActionController.select(this.tableState.data.filter(d => d.status === 'INFECTED'))
                    : this.groupActionController.deselect(this.tableState.data.filter(d => d.status === 'INFECTED'));
                  event.stopPropagation;
                }}
                checked={
                  this.tableState.data.length > 0 &&
                  this.tableState.data.filter(f => f.status === 'INFECTED').every(f => this.tableState.selectedList.includes(f))
                }
              />
            </antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        <div slot="table-body" style={{ display: 'contents' }}>
          {this.tableState.data.map(file => (
            <antivirus-card-table-row action-hover>
              <antivirus-card-table-cell selected={this.tableState.selectedList.includes(file)} doubleline>
                <span class="main-text">{file.name}</span>
                <span
                  class="add-text"
                  style={{ color: file.status === 'INFECTED' ? '#E44592' : file.status === 'HEALING' ? '#30ba9a' : '#9b9b9b' }}
                >
                  {this.t.msg(['INFECTED_FILES', 'STATUS', file.status])}
                </span>
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
                  <span
                    class={`menu-icon ${file.status !== 'INFECTED' && 'menu-icon_disabled'}`}
                    onClick={ev => (file.status === 'INFECTED' ? this.handleBurgerMenuClick(ev, file) : ev.preventDefault())}
                  >
                    <BurgerMenuIcon />
                  </span>
                </span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <antivirus-card-checkbox
                  onChanged={event => {
                    event.detail ? this.groupActionController.select(file) : this.groupActionController.deselect(file);
                    event.stopPropagation;
                  }}
                  onClick={event => file.status !== 'INFECTED' && event.preventDefault()}
                  checked={file.status === 'INFECTED' && this.tableState.selectedList.includes(file)}
                  readonly={file.status !== 'INFECTED'}
                />
              </antivirus-card-table-cell>
            </antivirus-card-table-row>
          ))}
        </div>
        <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>{this.t.msg(['TABLE', 'RECORD_COUNT'], { smart_count: this.tableState.elementCount })}</span>
            <TableGroupActions
              selectedCount={this.tableState.selectedList.length}
              action={[
                {
                  msg: this.t.msg(['INFECTED_FILES', 'ACTIONS', 'DELETE']),
                  name: 'delete',
                },
                {
                  msg: this.t.msg(['INFECTED_FILES', 'ACTIONS', 'HEAL']),
                  name: 'heal',
                },
              ]}
              t={this.t}
              handleActions={this.groupActionController.doAction.bind(this.groupActionController)}
            />
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
      </antivirus-card-table>,
      <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => (this.dropdownEl = el)}>
        <antivirus-card-vmenu>
          <antivirus-card-vmenu-item onClick={async ev => this.cureSubmitHandler(this.chosenFiles, ev)}>
            {this.t.msg(['INFECTED_FILES', 'ACTIONS', 'HEAL'])}
          </antivirus-card-vmenu-item>
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
            {this.chosenFiles &&
              (this.chosenFiles.length === 1
                ? this.t.msg(['INFECTED_FILES', 'MODAL', 'TITLE'], { filename: this.chosenFiles[0].name })
                : this.t.msg(['INFECTED_FILES', 'MODAL', 'GROUP_TITLE'], { smart_count: this.chosenFiles.length }))}
          </span>
          ?
        </span>
        <div class="flex-container" style={{ marginTop: 30 + 'px' }}>
          <antivirus-card-button onClick={() => this.deleteSubmitHandler(this.chosenFiles)}>
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
