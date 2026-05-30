import { HomeStatsResponse } from "@src/controllers/stats/types";
import { countProducedEvents } from "@src/db/query/stats/countProducedEvents.types";
import { countPublishedArtistsStats } from "@src/db/query/stats/countPublishedArtists.types";
import { Pool } from "pg";

export class StatsService {
  constructor(private db: Pool) {}

  async getHomeStats(): Promise<HomeStatsResponse> {
    const [artistsRows, eventsRows] = await Promise.all([
      countPublishedArtistsStats.run(undefined, this.db),
      countProducedEvents.run(undefined, this.db),
    ]);

    return {
      publishedArtists: artistsRows[0]?.total ?? 0,
      producedEvents: eventsRows[0]?.total ?? 0,
    };
  }
}

export default StatsService;
