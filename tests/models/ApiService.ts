import { HttpError, HttpService, HttpTransform } from '../../src/web';

class ApiService extends HttpService {
  protected readonly mock: jest.Mock;

  constructor() {
    super();
    this.mock = jest.fn(this.httpHandle.request);
    // @ts-ignore
    this.httpHandle.request = this.mock;
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

  protected baseUrl(): string {
    return '';
  }

  protected headers(): object {
    return {};
  }

  protected onRespondError(error: HttpError<{ error: string }>, transform: HttpTransform): void {
    transform.errorMessage = error.response.data.error;
  }

  protected timeoutMessage(): string {
    return 'Timeout!';
  }

  protected onShowError(): void {}

  protected onShowSuccess(): void {}
}

export const $api = new ApiService();
