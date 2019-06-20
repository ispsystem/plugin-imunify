import { Component, h, Prop } from '@stencil/core';

@Component({
  tag: 'antivirus-menu',
  styleUrl: 'antivirus-menu.css',
  shadow: true
})
export class AntivirusMenu {
  @Prop() url: string;

  render() {
    return (
      <ngispui-vmenu-item
        onClick={this.handleClickLink.bind(this)}
        class={location.href.startsWith(this.url) ? 'ngispui-vmenu-item_active' : ''}
      >
        <div slot="ngispui-vmenu-icon">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.5911 22.0457L22.8447 34.1363L27.4236 31.2179L32.4188 33.3025L26.5911 22.0457Z" stroke="#344A5E" />
            <path d="M26.528 16.8555L32.0252 28.255L33.3848 22.9924L38.4568 21.103L26.528 16.8555Z" stroke="#344A5E" />
            <path d="M22.7797 13.3012L34.7608 17.3342L31.9544 12.6813L34.1515 7.72822L22.7797 13.3012Z" stroke="#344A5E" />
            <path d="M17.5868 13.5329L28.9214 7.93056L23.6557 6.61353L21.7263 1.54978L17.5868 13.5329Z" stroke="#344A5E" />
            <path d="M13.4591 17.6939L17.7093 5.77157L13.012 8.49475L8.10874 6.20179L13.4591 17.6939Z" stroke="#344A5E" />
            <path d="M13.7219 22.9069L7.89279 11.3783L6.6449 16.7055L1.56414 18.624L13.7219 22.9069Z" stroke="#344A5E" />
            <path d="M18.0142 27.0094L6.11981 22.7268L8.82859 27.4373L6.5287 32.3434L18.0142 27.0094Z" stroke="#344A5E" />
            <path d="M23.5327 26.6297L12.0208 31.8568L17.2405 33.346L19.0031 38.4704L23.5327 26.6297Z" stroke="#344A5E" />
          </svg>
        </div>
        <div slot="ngispui-vmenu-label">Подпись пункта меню</div>
      </ngispui-vmenu-item>
    );
  }

  handleClickLink() {
    location.href = this.url;
  }
}
