import { BadRequestException } from '@nestjs/common';
import { ERRORS } from '../constants/errors.constants';

export function parseJSON<T = unknown>(value: unknown): T {
  if (typeof value === 'string') {
    if (value.trim() === '') {
      return undefined as T;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(value);
    } catch {
      throw new BadRequestException(ERRORS.COMMON.BAD_REQUEST);
    }
  }
  return value as T;
}

export function parseBoolean(value: unknown): boolean {
  if (value === 'false' || value === false) return false;
  return true;
}

export function parseStringArray(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];

  if (Array.isArray(value)) {
    return value.map(String).filter((s) => s.trim().length > 0);
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map(String).filter((s) => s.trim().length > 0);
        }
      } catch {
        throw new BadRequestException(ERRORS.COMMON.INVALID_ARRAY_FORMAT);
      }
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return [trimmed];
  }

  return [];
}
