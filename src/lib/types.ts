import dayjs from "dayjs";
import { ActorContext, ActorSystemRef, Ref } from "nact";

export enum MessageType {
  ERROR = "ERROR",
  RESULT = "RESULT",
  QUERY = "QUERY",
  QUERY_TEST = "QUERY_TEST",
}
export interface MessageQuery {
  type: MessageType.QUERY;
  query: any;
}
interface MessageQueryTest {
  type: MessageType.QUERY_TEST;
  query: any;
}
interface MessageResult {
  type: MessageType.RESULT;
  result: any;
}
interface MessageError {
  type: MessageType.ERROR;
  error: any;
}
export type StatsCollectorMessage =
  | MessageError
  | MessageQuery
  | MessageResult
  | MessageQueryTest;

export interface StatsQueryMessage<T> {
  range: {
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
  };
  query: T;
  sender: Ref<any>;
  renamerFn: (result: { [key: string]: any }) => { [key: string]: any };
}

export interface StatsQueryActorResult {
  [metricName: string]: number;
}

export type StatsQueryActor<T> = (
  msg: StatsQueryMessage<T>,
  ctx: ActorContext<any, ActorSystemRef>
) => void;

export type StatsQueryActorFn<QueryShape> = (
  msg: StatsQueryMessage<QueryShape>
) => Promise<StatsQueryActorResult>;
