export interface CreateExampleBody {
  name: string;
  description?: string | null;
}

export interface UpdateExampleBody {
  example_id: number | string;
  name?: string;
  description?: string | null;
}

export interface DeleteExampleBody {
  example_id: number | string;
}

export interface ExampleQuery {
  example_id?: string;
}

export interface ExampleItem {
  example_id: number;
  name: string;
  description: string | null;
}

export interface ExampleCreatedItem extends ExampleItem {
  created_at: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExamplePaginatedList {
  data: ExampleCreatedItem[];
  pagination: PaginationMeta;
}

export interface CreateExampleResponse {
  message: string;
  example: ExampleCreatedItem;
}

export type GetExampleByIdResponse = ExampleCreatedItem;
export type ListExampleResponse = ExamplePaginatedList;

export interface UpdateExampleResponse {
  message: string;
  example: ExampleItem;
}

export interface DeleteExampleResponse {
  message: string;
  example: Pick<ExampleItem, "example_id">;
}
