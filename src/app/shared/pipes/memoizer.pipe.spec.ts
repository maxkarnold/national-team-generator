import { MemoizerPipe } from './memoizer.pipe';

describe('MemoizerPipe', () => {
  it('create an instance', () => {
    const pipe = new MemoizerPipe();
    expect(pipe).toBeTruthy();
  });
});
