import { ThousandsCurrencyPipe } from './thousands-currency.pipe';

describe('ThousandsCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new ThousandsCurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
