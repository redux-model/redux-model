import { RequestModel } from '../../../../src';
import { resetNpmInfoModel } from './ResetNpmInfoModel';

interface Response {
  _id: string;
  license: string;
  homepage: string;
}

type Data = Partial<Response>;

class NpmInfoModel extends RequestModel<Data, Response> {
  action(packageName: string): RM.MiddlewareEffect<Response> {
    return this.get('/' + packageName, {
      query: {
        noCache: Date.now(),
      },
    });
  }

  protected getInitValue(): Data {
    return {};
  }

  protected onSuccess(_: Data, action: RM.ResponseAction<Response>): Data {
    return action.response;
  }

  protected getEffects(): RM.ReducerEffects<Data> {
    return [
      {
        when: resetNpmInfoModel.getSuccessType(),
        effect: (/* state, action */) => {
          return {};
        },
      }
    ];
  }
}

export const npmInfoModel = new NpmInfoModel();
