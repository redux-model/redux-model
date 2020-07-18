import { HttpServiceConfig, HttpService } from '../../src/services/HttpService';
import sleep from 'sleep-promise';

class ApiService<T> extends HttpService<T> {
  protected readonly mock: jest.Mock;

  constructor(config: HttpServiceConfig<T>) {
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

  public mockRejectValue(data?: any, duration: number = 0) {
    this.mock.mockImplementationOnce(async () => {
      if (duration > 0) {
        await sleep(duration);
      }

      return Promise.reject({
        data,
      });
    });
  }
}

export const $api = new ApiService<{ error: string }>({
  baseUrl: '',
  headers: () => {
    return {};
  },
  isSuccess: () => {
    return true;
  },
  onRespondError: (response, transform) => {
    transform.message = response.data.error;
  },
  onShowSuccess: () => {},
  onShowError: () => {},
  timeoutMessage: () => {
    return 'Timeout!';
  },
});
