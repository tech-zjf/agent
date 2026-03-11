import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
    transform(value: unknown): unknown {
        return this.deepTrim(value);
    }

    private deepTrim(value: unknown): unknown {
        if (typeof value === 'string') {
            return value.trim();
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.deepTrim(item));
        }

        if (value && typeof value === 'object') {
            const objectValue = value as Record<string, unknown>;
            const next: Record<string, unknown> = {};
            for (const [key, item] of Object.entries(objectValue)) {
                next[key] = this.deepTrim(item);
            }
            return next;
        }

        return value;
    }
}
