type DynamicObj = {
  [key: string]: any;
};

export const responseFormatter = <
  S extends number,
  M extends string,
  T extends DynamicObj | undefined
>(
  status: S,
  message: M,
  data: T
) => {
  return {
    meta: {
      status,
      message,
    },
    data: data || null,
  };
};

export const paginatedResponseFormatter = <
  S extends number,
  M extends string,
  T extends DynamicObj | undefined
>(
  status: S,
  message: M,
  data: T,
  page: number,
  limit: number,
  total: number
) => {
  return {
    meta: {
      status,
      message,
      limit: +limit,
      current: data ? data.length : 0,
      total,
      page: +page,
      hasNextPage: page * limit < total,
      totalPages: Math.ceil(total / limit),
    },
    data: data || null,
  };
};
