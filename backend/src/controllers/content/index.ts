import ContentService from "@src/services/content/contentService";
import { Pool } from "pg";

import ContentHandler from "./contentHandler";

class ContentController {
  list: ContentHandler["list"];

  constructor(db: Pool) {
    const contentService = new ContentService(db);
    const handler = new ContentHandler(contentService);

    this.list = handler.list;
  }
}

export default ContentController;
