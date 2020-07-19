import { Model } from '../../src';
import { $api } from '../libs/ApiService';

interface Data {
  counter: number;
}

export class ThrottleModel extends Model<Data> {
  enableThrottleProfile = $api.action((name: string) => {
    return this
      .get<{ id: number }>('/profile/manage')
      .query({
        name,
      })
      .throttle({
        duration: 3000,
      });
  });

  disableThrottleProfile = $api.action(() => {
    return this
      .get<{ id: number }>('/profile/manage')
      .throttle({
        duration: 3000,
        enable: false,
      });
  });

  configurableThrottle = $api.action((useCache: boolean) => {
    return this
    .get<{ id: number }>('/profile/manage')
    .throttle({
      duration: 3000,
      enable: useCache,
    });
  });

  withTransfer = $api.action((query: { name: string }) => {
    return this
      .get<{ id: number }>('/profile/manage')
      .query(query)
      .throttle({
        duration: 3000,
        transfer: (options) => {
          options.query.name = 'FIXED';
          return options;
        },
      });
  });

  protected initReducer(): Data {
    return {
      counter: 0,
    };
  }
}
