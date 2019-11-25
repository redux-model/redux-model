import { HttpResponse, HttpService } from '../../src/libs';
import { HttpServiceConfig } from '../../src/libs/types';

class ApiService extends HttpService {
  protected readonly mock: jest.Mock;

  constructor(config: HttpServiceConfig) {
    super(config);

    switch (process.env.TEST_PLATFORM) {
      case 'react-native':
      case 'web':
      case 'vue':
        // @ts-ignore
        this.mock = jest.fn(this.httpHandle.request);
        // @ts-ignore
        this.httpHandle.request = this.mock;
        break;
      default:
        throw new Error('Unknown TEST_PLATFORM');
    }
  }

  public mockResolveValue(data?: any) {
    this.mock.mockResolvedValueOnce({
      data,
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
