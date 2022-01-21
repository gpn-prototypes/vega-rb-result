import { MathHelper } from '../MathHelper';

describe('MathHelper', () => {
  test('test', async () => {
    expect(MathHelper.getNormalizerFixed(3, 3.3333333)).toEqual('3.333');
    expect(MathHelper.getNormalizerFixed(0, 3.3333333)).toEqual('3');
    expect(MathHelper.getNormalizerFixed(1, 3.3333333)).toEqual('3.3');
    expect(MathHelper.getNormalizerFixed(0, -3.3333333)).toEqual('-3.333');
  });
});
