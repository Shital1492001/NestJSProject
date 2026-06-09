import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.trimObject(item));
    }

    return this.trimObject(value);
  }

  private trimObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? obj.trim() : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.trimObject(item));
    }

    const trimmedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        trimmedObj[key] = this.trimObject(obj[key]);
      }
    }

    return trimmedObj;
  }
}
