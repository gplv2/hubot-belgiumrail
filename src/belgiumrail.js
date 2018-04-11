// Description:
//   Get National Rail live departure information
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_DEFAULT_STATION - set the default from station (nearest to your home/office)
//
// Commands:
//   hubot: trains from <departure station> to <arrival station> - Get trains from one station to another
//   hubot: trains to <arrival station> - Get trains from the default station to another
//
// Notes:
//   Inspired by the work of JamieMagee and John Hamelink
//   For Belgium railway
//
// Author:
//  Glenn Plas <glenn@bitles.be>


module.exports = function(robot) {
  const getTrainTimes = (msg, from, to) =>
    robot.http("https://api.irail.be/connections/").query({
      from: from.code,
      to: to.code,
      format: 'json'
    }).get()(function(err, res, body) {
      const json = JSON.parse(body);
      if (json.connection.length) {
        msg.send(`Next trains from: ${from.name} to ${to.name}:`);
        let i = 0;

        return (() => {
          const result = [];
          while (i < json.connection.length) {
            const station = json.trains[i];
            if (i < 5) {
              let response = `The ${station[1]} to ${station[2]}`;
              if (station[4].length) { response += ` at platform ${station[4]}`; }
              response += ` is ${/[^;]*$/.exec(station[3])[0].trim().toLowerCase()}`;
              msg.send(response);
            }
            result.push(i++);
          }
          return result;
        })();
      } else {
        return msg.send("Sorry, there's no trains today");
      }
    })
  ;

  const getStation = (msg, query, callback) =>
    robot.http('http://irail.be/stations/NMBS/${encodeURIComponent(query)}').get()(function(err, res, body) {
      const json = JSON.parse(body);
      if (json.length) {
        const station = {
          code: json[0][0],
          name: json[0][1]
        };

        return callback(station);
      } else {
        return msg.send(`Couldn't find station: ${query}`);
      }
    })
  ;

  robot.respond(/trains from (.+) to (.+)/i, function(msg) {
    let from = msg.match[1];
    let to = msg.match[2];
    if (from.length === 0) { from = process.env.HUBOT_DEFAULT_STATION; }
    return getStation(msg, from, function(station) {
      from = station;
      return getStation(msg, to, function(station) {
        to = station;
        return getTrainTimes(msg, from, to);
      });
    });
  });

  return robot.respond(/trains to (.+)/i, function(msg) {
    const fromCode = process.env.HUBOT_DEFAULT_STATION;
    let from = null;
    let to = msg.match[1];
    return getStation(msg, fromCode, function(station) {
      from = station;
      return getStation(msg, to, function(station) {
        to = station;
        return getTrainTimes(msg, from, to);
      });
    });
  });
};
