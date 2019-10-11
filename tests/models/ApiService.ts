import { HttpError, HttpService, HttpTransform } from '../../src/web';
import Mock = jest.Mock;

class ApiService extends HttpService {
  protected readonly mock: Mock;

  constructor() {
    super();
    this.mock = jest.fn(this.httpHandle.request);
    // @ts-ignore
    this.httpHandle.request = this.mock;
  }

  public mockValue(data?: any) {
    this.mock.mockResolvedValue({
      data,
    });
  }

  protected baseUrl(): string {
    return 'http://localhost';
  }

  protected headers(): object {
    return {};
  }

  protected onRespondError(error: HttpError<{ message: string }>, transform: HttpTransform): void {
    transform.errorMessage = error.response.data.message;
  }

  protected onShowError(): void {}

  protected onShowSuccess(): void {}
}

export const $api = new ApiService();
