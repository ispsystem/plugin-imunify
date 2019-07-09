import { Component, h, Prop, State } from '@stencil/core';
import { RootState } from '../../redux/reducers';
import { ActionTypes } from '../../redux/actions';
import { Store } from '@stencil/redux';
import { AntivirusState } from '../../models/antivirus.reducers';
import { pad } from '../../utils/tools';

@Component({
  tag: 'antivirus-card-history',
  styleUrl: 'styles/$.scss'
})
export class History {
  @Prop({ context: 'store' }) store: Store<RootState, ActionTypes>;
  @State() history: AntivirusState['history'];

  componentWillLoad() {
    this.store.mapStateToProps(this, state => ({ ...state.antivirus }));
  }

  getDayMonthYearAsStr(date: Date) {
    return `${pad(date.getDay())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  getTimeAsStr(date: Date) {
    return `${date.getHours()}.${pad(date.getMinutes())}`;
  }

  render() {
    return (
      <antivirus-card-table>
        <div slot="table-header" style={{ display: 'contents' }}>
          <antivirus-card-table-row style={{ height: '50px', 'vertical-align': 'middle' }}>
            <antivirus-card-table-cell style={{ width: 220 - 40 + 'px' }}>Дата проверки</antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 200 - 20 + 'px' }}>Тип</antivirus-card-table-cell>
            <antivirus-card-table-cell style={{ width: 547 - 20 + 'px' }}>Найдено угроз</antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        <div slot="table-body" style={{ display: 'contents' }}>
          {this.history.map(historyItem => (
            <antivirus-card-table-row action-hover>
              <antivirus-card-table-cell doubleline>
                <span class="main-text">{this.getDayMonthYearAsStr(new Date(historyItem.date))}</span>
                <span class="add-text">{this.getTimeAsStr(new Date(historyItem.date))}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="isp-table-cell__main-text">{historyItem.checkType}</span>
              </antivirus-card-table-cell>
              <antivirus-card-table-cell doubleline>
                <span class="isp-table-cell__main-text">{historyItem.infectedFilesCount}</span>
              </antivirus-card-table-cell>
            </antivirus-card-table-row>
          ))}
        </div>
        {/* <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>1 запись</span>
            <antivirus-card-table-pagination />
          </div>
        </div> */}
      </antivirus-card-table>
    );
  }
}
