import { Component, h } from '@stencil/core';

@Component({
  tag: 'antivirus-card-history',
  styleUrl: 'styles/$.scss'
})
export class History {
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
          <antivirus-card-table-row action-hover>
            <antivirus-card-table-cell doubleline>
              <span class="main-text">29.05.2019</span>
              <span class="add-text">6:45</span>
            </antivirus-card-table-cell>
            <antivirus-card-table-cell doubleline>
              <span class="isp-table-cell__main-text">полная</span>
            </antivirus-card-table-cell>
            <antivirus-card-table-cell doubleline>
              <span class="isp-table-cell__main-text">54</span>
            </antivirus-card-table-cell>
          </antivirus-card-table-row>
        </div>
        <div slot="table-footer" style={{ display: 'contents' }}>
          <div class="antivirus-card-table-list__footer">
            <span>1 запись</span>
            <antivirus-card-table-pagination />
          </div>
        </div>
      </antivirus-card-table>
    );
  }
}
