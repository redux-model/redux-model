import { TestModel } from '../libs/TestModel';
import { $api } from '../libs/ApiService';
import { $throttleApi } from '../libs/ThrottleService';

// Notice: Keep Data as null to make sure http-servie and null-data can work fine together.
export class ThrottleModel extends TestModel {
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
      .metas(1)
      .throttle({
        duration: 3000,
        enable: false,
      });
  });

  configurableThrottle = $api.action((useCache: boolean) => {
    return this
    .get<{ id: number }>('/profile/manage')
    .metas(1)
    .payload(1)
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

  withGlobalTransfer = $throttleApi.action((query: { name: string }) => {
    return this
      .get<{ id: number }>('/profile/manage')
      .query(query)
      .throttle({
        duration: 3000,
        transfer: (options) => {
          options.query.name = 'FIXED';
        },
      });
  });

  protected initialState() {
    return null;
  }
}
