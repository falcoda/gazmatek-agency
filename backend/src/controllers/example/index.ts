import ExampleService from "@src/services/example/exampleService";
import { Pool } from "pg";

import ExampleCRUD from "./exampleCRUD";

class ExampleController {
  add: ExampleCRUD["add"];
  getById: ExampleCRUD["getById"];
  list: ExampleCRUD["list"];
  update: ExampleCRUD["update"];
  delete: ExampleCRUD["delete"];

  constructor(db: Pool) {
    const exampleService = new ExampleService(db);
    const exampleCRUD = new ExampleCRUD(exampleService);

    this.add = exampleCRUD.add.bind(exampleCRUD);
    this.getById = exampleCRUD.getById.bind(exampleCRUD);
    this.list = exampleCRUD.list.bind(exampleCRUD);
    this.update = exampleCRUD.update.bind(exampleCRUD);
    this.delete = exampleCRUD.delete.bind(exampleCRUD);
  }
}

export default ExampleController;
