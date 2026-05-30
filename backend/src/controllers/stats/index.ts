import StatsService from "@src/services/stats/statsService";
import { Pool } from "pg";

import StatsHandler from "./statsHandler";

class StatsController {
  home: StatsHandler["home"];

  constructor(db: Pool) {
    const statsService = new StatsService(db);
    const handler = new StatsHandler(statsService);

    this.home = handler.home;
  }
}

export default StatsController;
