export type PaginationMetadata = {
  totalPage: number;
  total: number;
  perPage: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
};

export const paginationMetadata = ({
  total,
  limit,
  page
}: {
  total: number;
  limit: number;
  page: number;
}): PaginationMetadata => {
  const totalPage = Math.ceil(total / limit);
  const metaData = {
    totalPage,
    total,
    perPage: limit,
    currentPage: page,
    nextPage: page >= totalPage || totalPage === 1 ? null : page + 1,
    previousPage: page === 1 || page > totalPage + 1 ? null : page - 1
  };
  return metaData;
};
