import { TruncateStringPipe } from './truncate-string.pipe';

describe('TruncateStringPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncateStringPipe();
    expect(pipe).toBeTruthy();
  });
});
