# Hubot Belgium Rail

I wrote hubot-belgium-rail in response to the fact that iRail made a decent API which made it worth implementing

## Installation

You can install this hubot as an external script directly using npm:

 - npm install https://github.com/gplv2/hubot-belgiumrail.git

And then add this to `external-scripts.json` array

    "hubot-belgiumrail",

## Configuration

You need to set the following:

 - `HUBOT_DEFAULT_STATION` set this to station code of your nearest station ([see here for codes](https://docs.irail.be/#stations))
 - [irail stations](https://github.com/iRail/stations)

## Commands

 - `hubot: trains from <departure station> to <arrival station>` - Show the next trains from one station to the other
 - `hubot: trains to <arrival station>` - Show the next trains from the default station to the arrival station
