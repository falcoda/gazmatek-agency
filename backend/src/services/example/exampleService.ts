import {
  CreateExampleBody,
  DeleteExampleBody,
  ExampleCreatedItem,
  ExampleItem,
  ExamplePaginatedList,
  UpdateExampleBody,
} from "@src/controllers/example/types";
import { countExamples } from "@src/db/query/example/countExamples.types";
import { createExample } from "@src/db/query/example/createExample.types";
import { deleteExample } from "@src/db/query/example/deleteExample.types";
import { getExampleById } from "@src/db/query/example/getExampleById.types";
import { listExamples } from "@src/db/query/example/listExamples.types";
import { updateExample } from "@src/db/query/example/updateExample.types";
import { DatabaseError, NotFoundError } from "@src/helpers/error/errors";
import { Pool } from "pg";

export class ExampleService {
  constructor(private db: Pool) {}

  async createExample(body: CreateExampleBody): Promise<ExampleCreatedItem> {
    const rows = await createExample.run(
      { name: body.name, description: body.description ?? null },
      this.db,
    );

    if (rows.length === 0) {
      throw new DatabaseError();
    }

    const row = rows[0];

    return {
      example_id: Number(row.example_id),
      name: row.name,
      description: row.description,
      created_at: row.created_at,
    };
  }

  async getById(
    exampleId: string,
  ): Promise<ExampleItem & { created_at: Date }> {
    const rows = await getExampleById.run({ exampleId }, this.db);

    if (rows.length === 0) {
      throw new NotFoundError("Example not found");
    }

    const row = rows[0];

    return {
      example_id: Number(row.example_id),
      name: row.name,
      description: row.description,
      created_at: row.created_at,
    };
  }

  async list(page: number, limit: number): Promise<ExamplePaginatedList> {
    const offset = (page - 1) * limit;

    const [rows, countRows] = await Promise.all([
      listExamples.run({ limit, offset }, this.db),
      countExamples.run(undefined, this.db),
    ]);

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows.map((row) => ({
        example_id: Number(row.example_id),
        name: row.name,
        description: row.description,
        created_at: row.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateExample(body: UpdateExampleBody): Promise<ExampleItem> {
    const rows = await updateExample.run(
      {
        exampleId: body.example_id,
        name: body.name,
        description: body.description ?? null,
      },
      this.db,
    );

    if (rows.length === 0) {
      throw new NotFoundError("Example not found");
    }

    const row = rows[0];

    return {
      example_id: Number(row.example_id),
      name: row.name,
      description: row.description,
    };
  }

  async deleteExample(
    body: DeleteExampleBody,
  ): Promise<Pick<ExampleItem, "example_id">> {
    const rows = await deleteExample.run(
      { exampleId: body.example_id },
      this.db,
    );

    if (rows.length === 0) {
      throw new NotFoundError("Example not found or already deleted");
    }

    return { example_id: Number(rows[0].example_id) };
  }
}

export default ExampleService;
