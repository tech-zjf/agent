import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiCodeStatus } from '../constant/api-code';

export class ApiException extends HttpException {
    constructor(
        private readonly apiCode: ApiCodeStatus,
        private readonly errorMessage?: string,
        status = HttpStatus.BAD_REQUEST,
    ) {
        super(errorMessage || apiCode.msg, status);
    }

    getErrorCode(): string {
        return this.apiCode.code;
    }

    getErrorMessage(): string {
        return this.errorMessage || this.apiCode.msg;
    }
}
