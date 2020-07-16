import { HttpServiceConfig, HttpService, HttpResponse } from '../../src/services/HttpService';
import sleep from 'sleep-promise';

class ApiService extends HttpService {
  protected readonly mock: jest.Mock;

  constructor(config: HttpServiceConfig) {
    super(config);

    this.mock = jest.fn(this.httpHandler.request);
    this.httpHandler.request = this.mock;
  }

  public mockResolveValue(data?: any, duration: number = 0) {
    this.mock.mockImplementationOnce(async () => {
      if (duration > 0) {
        await sleep(duration);
      }

      return {
        data,
      };
    });
  }

  public mockRejectValue(data?: any) {
    this.mock.mockRejectedValue({
      data,
    });
  }
}

export const $api = new ApiService({
  baseUrl: '',
  headers: () => {
    return {};
  },
  isSuccess: () => {
    return true;
  },
  onRespondError: (response: HttpResponse<{ error: string }>, transform) => {
    transform.message = response.data.error;
  },
  onShowSuccess: () => {},
  onShowError: () => {},
  timeoutMessage: () => {
    return 'Timeout!';
  },
});
