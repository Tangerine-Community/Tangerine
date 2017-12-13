import { TruncateValuePipe } from './truncate-value.pipe';

describe('TruncateValuePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateValuePipe();
    expect(pipe).toBeTruthy();
  });
});
