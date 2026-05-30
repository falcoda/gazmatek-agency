import PricingService from "@src/services/pricing/pricingService";
import { Pool } from "pg";

import PricingHandler from "./pricingHandler";

class PricingController {
  estimate: PricingHandler["estimate"];
  artistFee: PricingHandler["artistFee"];
  grid: PricingHandler["grid"];

  constructor(db: Pool) {
    const pricingService = new PricingService(db);
    const handler = new PricingHandler(pricingService);

    this.estimate = handler.estimate;
    this.artistFee = handler.artistFee;
    this.grid = handler.grid;
  }
}

export default PricingController;
