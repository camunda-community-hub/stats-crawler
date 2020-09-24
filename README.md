# Stats Collector

A stats collector that runs on a schedule and updates a Google Sheet.

It is built using the [nact](https://nact.io/) library (actor model, used in Zeebe's internal architecture).

## Environment variables

There is a file `.env.template`. You need to make a copy of this file to `.env` and populate it.

You need to set the connection variables for a Camunda Cloud connection in there. 

The Google credential setup is [here](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account).

## Configuration

The file `src/config.json` contains the collection configuration.

Config file values like this: `${{ZEEBE_FORUM_API_KEY}}` are replaced by the process environment variable with that name at runtime.

## Deployment

You can use the command `npm run docker:start` to build and start the stats collector as a Docker container. It will start in detached mode, but with the logs streaming.

To stop the container, hit Ctrl-C to stop the log stream, and use the command `npm run docker:stop`.

To reattach to the log stream, use `npm run docker:logs`.

## Extending with New Metric Collectors

To add another metric collector:

* Implement a `StatsQueryActorFn`. This function takes a message with a `query` and `range` parameter, and returns a Promise of the result, which is an object with metric name keys and metric values. If the actor throws or rejects while collecting metrics, the rejection is converted into an error outcome automatically. See the `src/lib/npm-actor.ts` and `src/lib/discourse-actor.ts` for examples.

* Add the actor to the `Actor` enum in `src/app.ts`. This is both the name of the actor and its config key in the `src/config.json`.

* Spawn a stateless actor in `src/app.ts` using the `makeActor` function, as is done for the existing actors.

* The `rename` feature is used to map the generic metric names produced by the `StatsQueryActorFn` to specific names for the query.

