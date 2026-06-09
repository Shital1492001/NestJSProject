export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class PaginationUtil {
  static getPaginationParams(params: PaginationParams): {
    skip: number;
    take: number;
    order: Record<string, 'ASC' | 'DESC'>;
  } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'DESC';

    return {
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    };
  }

  static createPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResponse<T> {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
