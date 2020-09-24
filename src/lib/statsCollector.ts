import { dispatch } from "nact";
import dayjs from "dayjs";
import merge from "deepmerge";
import { MessageType, StatsCollectorMessage } from "./types";
import { renamerFactory } from "./renamerFactory";

export const statsCollectorActor = (
  state = {} as any,
  msg: StatsCollectorMessage,
  ctx
) => {
  switch (msg.type) {
    case MessageType.QUERY_TEST:
    case MessageType.QUERY: {
      const startDate = dayjs().subtract(1, "month").startOf("month");
      const endDate = startDate.endOf("month");
      let expectedOutcomesCount = 0;

      Object.keys(msg.query).forEach((actorName) =>
        msg.query[actorName].forEach((query) => {
          const msg = {
            range: { startDate, endDate },
            query,
            renamerFn: renamerFactory(query.rename),
            sender: ctx.self,
          };
          dispatch(ctx.children.get(actorName), msg);
          expectedOutcomesCount++;
        })
      );

      return {
        ...state,
        expectedOutcomesCount,
        range: {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        },
        results: [],
        errors: [],
      };
    }
    case MessageType.RESULT:
    case MessageType.ERROR: {
      if (msg.type === MessageType.RESULT || msg.type === MessageType.ERROR) {
        const newState =
          msg.type === MessageType.RESULT
            ? { ...state, results: merge(state.results, [msg.result]) }
            : {
                ...state,
                errors: merge(state.errors, [msg.error]),
              };
        const outcomesCollectedCount =
          newState.results.length + newState.errors.length;

        if (outcomesCollectedCount === state.expectedOutcomesCount) {
          dispatch(ctx.children.get("reportingActor"), newState);
        }
        return newState;
      }
    }
    default:
      return assertUnreachable(msg);
  }
};

function assertUnreachable(type: never): never {
  throw new Error("Missing type");
}
