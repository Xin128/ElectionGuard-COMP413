import { plus } from './onePlusOne'

test('the data is Van Sama', () => {
  expect(1).toBe(1)
});

test('one plus one?', () => {
  expect(plus(1n, 1n)).toBe(2n)
});

