import { Component, h, Host, Event, EventEmitter, State, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { pad } from '../../utils/tools';
import { ITranslate } from '../../models/translate.reducers';
import { AntivirusState } from '../../models/antivirus/state';

@Component({
  tag: 'antivirus-card-infected-files',
  styleUrl: 'styles/$.scss',
})
export class InfectedFiles {
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() infectedFiles: AntivirusState['infectedFiles'];
  @State() isProVersion: AntivirusState['isProVersion'];
  /** translate object */
  @State() t: ITranslate;
  @Event() openBuyModal: EventEmitter;

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus, t: state.translate }));
  }

  render() {
    return (
      <Host>
        {(this.infectedFiles && this.infectedFiles.length) > 0 ? this.renderInfectedFilesTable() : this.renderEmptyListPlaceholder()}
      </Host>
    );
  }

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
          {this.infectedFiles.map(file => (
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
            </antivirus-card-table-row>
          ))}
        </div>
        {/** @todo: change when backend will can work with pagination */
        /* <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>1 запись</span>
            <antivirus-card-table-pagination />
          </div>
        </div> */}
      </antivirus-card-table>
    );
  };
}
