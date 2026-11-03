import { requestIdMiddleware } from '../src/common/request-id.middleware';

describe('requestIdMiddleware', () => {
  it('preserves a valid incoming request id and returns it in the response', () => {
    const request = { header: jest.fn().mockReturnValue('client-request-1') };
    const response = { setHeader: jest.fn() };
    const next = jest.fn();
    requestIdMiddleware(request as never, response as never, next);
    expect(request).toHaveProperty('requestId', 'client-request-1');
    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'client-request-1');
    expect(next).toHaveBeenCalled();
  });
});
