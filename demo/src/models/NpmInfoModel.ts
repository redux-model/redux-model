import { Model } from '../../../src';

interface Response {
  _id: string;
  license: string;
  homepage: string;
}

type Data = Partial<Response>;

class NpmInfoModel extends Model<Data> {
  manage = this.actionRequest({
    action: (packageName: string) => {
      return this.get('/' + packageName, {
        query: {
          noCache: Date.now(),
        },
      });
    },
    onSuccess: (_, action) => {
      return action.response;
    },
    meta: true,
  });

  reset = this.actionNormal({
    action: () => {
      return this.emit();
    },
    onSuccess: () => {
      return {};
    },
  });

  protected getInitValue(): Data {
    return {};
  }
}

export const npmInfoModel = new NpmInfoModel();
