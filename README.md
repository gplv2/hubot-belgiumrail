# Hubot Belgium Rail

I wrote hubot-belgium-rail in response to the UK version of nationalrail.coffee by @JaimeMagee.

## Configuration

You need to set the following:

 - `HUBOT_DEFAULT_STATION` set this to station code of your nearest station ([see here for codes](https://docs.irail.be/#stations))
 - [irail stations](https://github.com/iRail/stations)

## Commands

 - `hubot: trains from <departure station> to <arrival station>` - Show the next trains from one station to the other
 - `hubot: trains to <arrival station>` - Show the next trains from the default station to the arrival station
