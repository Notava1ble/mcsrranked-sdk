import * as v from "valibot";

const integer = v.pipe(v.number(), v.integer());

const heartbeatSchema = v.object({
  status: integer,
  time: v.string(),
  msg: v.string(),
  ping: v.nullable(v.number()),
});

export const statusHeartbeatsSchema = v.object({
  heartbeatList: v.record(v.string(), v.array(heartbeatSchema)),
  uptimeList: v.record(v.string(), v.number()),
});

export type StatusHeartbeats = v.InferOutput<typeof statusHeartbeatsSchema>;
