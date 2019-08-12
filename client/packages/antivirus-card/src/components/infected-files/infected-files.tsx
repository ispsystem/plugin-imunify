import { Component, h, Host, Event, EventEmitter, State, Prop, Method } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { pad } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { AntivirusState, InfectedFile } from '../../models/antivirus/state';
import { BurgerMenuIcon } from '../icons/burgerMenu';
import { AntivirusActions } from '../../models/antivirus/actions';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss',
})
export class InfectedFiles {
  /** Ref for dropdown element */
  dropdownEl!: HTMLAntivirusCardDropdownElement;

  deleteFiles: typeof AntivirusActions.deleteFiles;
  /** Ref for deletion confirm modal */
  deletionModal!: HTMLAntivirusCardModalElement;

  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() siteId: number;
  @State() infectedFiles: AntivirusState['infectedFiles'];
  /** returns true if the user has the pro version */
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;
  @State() fileToDelete: InfectedFile;
  @Event() openBuyModal: EventEmitter;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate, siteId: state.siteId }));
    this.store.mapDispatchToProps(this, {
      deleteFiles: AntivirusActions.deleteFiles,
    });
  }

  render() {
    return (
      <Host>
        {(this.infectedFiles && this.infectedFiles.length) > 0 ? this.renderInfectedFilesTable() : this.renderEmptyListPlaceholder()}
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

  getDayMonthYearAsStr(date: Date) {
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  getTimeAsStr(date: Date) {
    return `${date.getHours()}.${pad(date.getMinutes())}`;
  }

  @Method()
  async openDeletionModal(ev: MouseEvent) {
    console.log(this.fileToDelete);

    await this.deletionModal.toggle(true);
    await this.dropdownEl.toggle(ev);
    return true;
  }

  /**
   * Handles delete modal submit button
   * @param siteId Site's id
   * @param fileId File's id
   */
  private deleteSubmitHandler(siteId: number, fileId: number): void {
    this.deleteFiles(siteId, [fileId]);
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
          {this.infectedFiles.map(file => [
            <antivirus-card-table-row action-hover>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{file.name}</span>
                <span class="add-text">{this.t.msg(['INFECTED_FILES', 'STATUS', file.status])}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text main-text__ellipsis">{file.threatName}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{this.getDayMonthYearAsStr(new Date(file.detectionDate))}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{file.path}</span>
                <span class="add-text">
                  {file.lastChangeDate
                    ? this.t.msg(['DATETIME_CHANGED'], {
                        date: this.getDayMonthYearAsStr(new Date(file.lastChangeDate)),
                        time: this.getTimeAsStr(new Date(file.lastChangeDate)),
                      })
                    : this.t.msg(['DATETIME_CREATED'], {
                        date: this.getDayMonthYearAsStr(new Date(file.createdDate)),
                        time: this.getTimeAsStr(new Date(file.createdDate)),
                      })}
                </span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">
                  <span class="menu-icon" onClick={(ev: MouseEvent) => ((this.fileToDelete = file), this.dropdownEl.toggle(ev))}>
                    <BurgerMenuIcon />
                  </span>
                </span>
              </antivirus-card-table-cell>
            </antivirus-card-table-row>,
          ])}
        </div>
        {/** @todo: change when backend will can work with pagination */
        /* <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>1 запись</span>
            <antivirus-card-table-pagination />
          </div>
        </div> */}
      </antivirus-card-table>,
      <antivirus-card-dropdown ref={(el: HTMLAntivirusCardDropdownElement) => (this.dropdownEl = el)}>
        <antivirus-card-vmenu>
          <antivirus-card-vmenu-item>{this.t.msg(['INFECTED_FILES', 'ACTIONS', 'HEAL'])}</antivirus-card-vmenu-item>
          {/*<antivirus-card-vmenu-item>{this.t.msg(['INFECTED_FILES', 'ACTIONS', 'EXCLUDE'])}</antivirus-card-vmenu-item>*/}
          <antivirus-card-vmenu-item style={{ marginBottom: '30px' }}>
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
            {this.t.msg(['INFECTED_FILES', 'MODAL', 'TITLE'], { filename: this.fileToDelete && this.fileToDelete.name })}
          </span>
          ?
        </span>
        <div class="flex-container" style={{ marginTop: 30 + 'px' }}>
          <antivirus-card-button onClick={() => this.deleteSubmitHandler(this.siteId, this.fileToDelete && this.fileToDelete.id)}>
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
