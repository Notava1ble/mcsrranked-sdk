import * as v from "valibot";

import { userProfileSchema } from "./user.js";

const integer = v.pipe(v.number(), v.integer());
const resultSchema = v.objectWithRest({ total: integer }, integer);

export const versusStatsSchema = v.object({
  players: v.array(userProfileSchema),
  results: v.object({
    ranked: resultSchema,
    casual: resultSchema,
  }),
  changes: v.record(v.string(), integer),
});

export type VersusStats = v.InferOutput<typeof versusStatsSchema>;
