import { AxiosRequestConfig } from 'axios';
import { BaseRequestAction, HttpServiceBuilder, requestActionProxyKeys as superProxyKeys } from '../core';

export const requestActionProxyKeys: {
  methods: (keyof RequestAction<any, any, any, any, any>)[];
} = {
  methods: [...superProxyKeys.methods],
};

export class RequestAction<Data, Builder extends (...args: any[]) => HttpServiceBuilder<Data, Response, Payload, AxiosRequestConfig, M>, Response, Payload, M> extends BaseRequestAction<Data, Builder, Response, Payload, M> {

  protected getProxyMethods(): string[] {
    return requestActionProxyKeys.methods;
  }
}
