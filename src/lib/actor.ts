import { dispatch } from "nact";
import { MessageType, StatsQueryActor, StatsQueryMessage } from "./types";

export function makeActor<T>(
  fn: (query: StatsQueryMessage<T>) => Promise<any>
): StatsQueryActor<T> {
  return function (msg, ctx) {
    fn(msg)
      .then((result) =>
        dispatch(msg.sender, {
          result: msg.renamerFn(result),
          type: MessageType.RESULT,
        })
      )
      .catch((e) =>
        dispatch(msg.sender, {
          error: {
            actor: ctx.name,
            query: { ...msg.query, apiKey: "XXXXXXX" },
            error: e.toString(),
          },
          type: MessageType.ERROR,
        })
      );
  };
}
