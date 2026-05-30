import ArtistService from "@src/services/artist/artistService";
import { Pool } from "pg";

import ArtistCRUD from "./artistCRUD";

class ArtistController {
  list: ArtistCRUD["list"];
  getBySlug: ArtistCRUD["getBySlug"];

  constructor(db: Pool) {
    const artistService = new ArtistService(db);
    const artistCRUD = new ArtistCRUD(artistService);

    this.list = artistCRUD.list;
    this.getBySlug = artistCRUD.getBySlug;
  }
}

export default ArtistController;
