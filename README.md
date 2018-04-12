# Hubot Belgium Rail

A simple client for the API exposed by [iRail.be](https://irail.be/)

I wrote hubot-belgium-rail in response to the fact that iRail made a decent API which made it fun and worth implementing

You can see it live in action at the BE-OSM chat channel on riot https://riot.im/app/#/register and visit #osmbe:matrix.org room

![Example from matrix](/screenshots/screenshot1.png)


## Installation

You can install this hubot as an external script directly using npm:

 - npm install https://github.com/gplv2/hubot-belgiumrail.git

And then add this to `external-scripts.json` array :

    "hubot-belgiumrail",

## Configuration

You may want to set the following:

 - `HUBOT set default train_station <station>` set this to station code of your nearest station ([get list of station names here](https://docs.irail.be/#stations)) (API call)

## More information
 - [irail stations](https://github.com/iRail/stations)

## Commands

 - `HUBOT trains from <departure station> to <arrival station>` - Show the next trains from one station to the other
 - `HUBOT trains to <arrival station>` - Show the next trains from the default station to the arrival station
 - `HUBOT trains to <arrival station>` - Show the next trains from the default station to the arrival station
 - `HUBOT set default train_station <station>` - Set the default station and save it to the brain
 - `HUBOT get default train_station`           - Get the default station from the brain
