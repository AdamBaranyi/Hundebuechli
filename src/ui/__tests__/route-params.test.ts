import { uuidParam } from '../route-params';

describe('Parameter aus Links', () => {
  it('nimmt nur eine UUID an', () => {
    expect(uuidParam('5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f')).toBe(
      '5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f',
    );
    expect(uuidParam(['5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f'])).toBe(
      '5f3c2d8e-4b1a-4c2e-9f7d-1a2b3c4d5e6f',
    );
    expect(uuidParam('keine-uuid')).toBeNull();
    expect(uuidParam('<script>')).toBeNull();
    expect(uuidParam("1' OR '1'='1")).toBeNull();
    expect(uuidParam(undefined)).toBeNull();
    expect(uuidParam(42)).toBeNull();
  });
});
