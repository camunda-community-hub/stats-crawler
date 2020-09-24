import { ActorContext, ActorSystemRef } from "nact";

export const reportingActor = (
  msg: any,
  _: ActorContext<any, ActorSystemRef>
) => {
  console.log(JSON.stringify(msg, null, 2));
};
