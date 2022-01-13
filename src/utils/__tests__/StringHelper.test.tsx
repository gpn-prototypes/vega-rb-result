import { getNumberWithSpaces } from '../StringHelper';

describe('StringHelper', () => {
  test('test', async () => {
    expect(getNumberWithSpaces('1234567')).toEqual('1 234 567');
    expect(getNumberWithSpaces('1')).toEqual('1');
    expect(getNumberWithSpaces('12')).toEqual('12');
    expect(getNumberWithSpaces('123')).toEqual('123');
    expect(getNumberWithSpaces('1234')).toEqual('1 234');
  });
});
