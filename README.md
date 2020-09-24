# stats-crawler

A stats collector that runs on a schedule and updates a Google Sheet.

It is built using the [nact](https://nact.io/) library and the actor model.

## Environment variables

You need to set the connection variables for a Camunda Cloud connection. 

The Google credential setup is [here](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account).

Config file values like this: `${{ZEEBE_FORUM_API_KEY}}` are replaced by the process environment variable with that name at runtime.