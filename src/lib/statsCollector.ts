import dayjs from "dayjs";
import { ActorContext, ActorSystemRef, dispatch, query } from "nact";
import { renamerFactory } from "./renamerFactory";

const TIMEOUT_MS = 30000;

interface QueryParams {
  [queryParam: string]: any;
  rename?: { [key: string]: string };
}

interface Query {
  sender: ActorSystemRef;
  query: {
    [actorName: string]: QueryParams[];
  };
}

export const statsCollectorActor = async (
  queryMsg: Query,
  ctx: ActorContext<any, ActorSystemRef>
) => {
  const startDate = dayjs().subtract(1, "month").startOf("month");
  const endDate = startDate.endOf("month");

  const tasks = Object.keys(queryMsg.query).flatMap((actorName) =>
    queryMsg.query[actorName].map((q) =>
      query(
        ctx.children.get(actorName)!,
        (sender) => ({
          range: { startDate, endDate },
          query: q,
          renamerFn: renamerFactory(q.rename),
          sender,
        }),
        TIMEOUT_MS
      ).catch((e) =>
        e.error
          ? e
          : {
              error: {
                actor: actorName,
                query: { ...q, apiKey: "<REDACTED>" },
                error: e.toString(),
              },
            }
      )
    )
  );
  const outcomes = await Promise.allSettled(tasks);
  const response = outcomes.reduce(
    (prev, curr) => {
      if (curr.status === "fulfilled") {
        return curr.value.result
          ? {
              ...prev,
              results: { ...prev.results, ...curr.value.result },
              errors: prev.errors,
            }
          : {
              ...prev,
              results: prev.results,
              errors: [...prev.errors, curr.value.error],
            };
      } else {
        return {
          ...prev,
          results: prev.results,
          errors: [...prev.errors, { PromiseRejected: curr }],
        };
      }
    },
    {
      startDate: {
        year: startDate.format("YYYY"),
        month: startDate.format("MM"),
      },
      results: [] as any[],
      errors: [] as any[],
    }
  );

  dispatch(queryMsg.sender, response);
};
