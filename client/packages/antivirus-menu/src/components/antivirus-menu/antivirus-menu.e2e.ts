import { newE2EPage } from './node_modules/@stencil/core/testingil/core/testing';

describe('antivirus-menu', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<antivirus-menu></antivirus-menu>');
    const element = await page.find('antivirus-menu');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<antivirus-menu></antivirus-menu>');
    const component = await page.find('antivirus-menu');
    const element = await page.find('antivirus-menu >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('first', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('last', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('middle', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
