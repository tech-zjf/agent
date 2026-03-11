import { ResponseCode } from './constant';

export interface ServiceEnvelope<T> {
    code: ResponseCode | string;
    msg: string;
    data: T;
}
