import { HttpServiceConfig, HttpService } from '../../src/services/HttpService';
import sleep from 'sleep-promise';

export class ApiService<T> extends HttpService<T> {
  protected readonly mock: jest.Mock;

  constructor(config: HttpServiceConfig<T>) {
    super(config);

    this.mock = jest.fn(this.request);
    // @ts-ignore
    this.request = this.mock;
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

    this.mock.mockRejectedValue({
      data,
    });
  }

  public clone<NewErrorData = T>(config: Partial<HttpServiceConfig<NewErrorData>>): ApiService<NewErrorData> {
    // @ts-ignore
    // @ts-expect-error
    return new ApiService<U>({
      ...this.config,
      ...config,
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
  onRespondError: (response, meta) => {
    meta.message = response.data.error;
  },
  onShowSuccess: () => {},
  onShowError: () => {},
  timeoutMessage: () => {
    return 'Timeout!';
  },
});
