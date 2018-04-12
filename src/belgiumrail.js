/*jslint node: true */

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
//  HUBOT trains from <departure station> to <arrival station> - Get trains from one station to another
//  HUBOT trains to <arrival station> - Get trains from the default station to another
//  HUBOT set default train_station <default station> - saves default station to the brain
//  HUBOT get default train_station <default station> - shows the default station to the brain
//
// Notes:
//   Inspired by the work of JamieMagee and John Hamelink
//   reworked for Belgium railway using iRail API
//
// Author:
//  Glenn Plas <glenn@bitles.be>
//  https://api.irail.be/connections/?from=Weerde&to=Brussel-Schuman&format=json
//
//
'use strict';


module.exports = function(robot) {
  var md5 = require('md5');

  const getTrainTimes = (msg, from, to) =>
    robot.http("https://api.irail.be/connections/?").query({
      from: from,
      to: to,
      format: 'json'
    }).get()(function(err, res, body) {
      const json = JSON.parse(body);
	    console.log(json);
      if (json.connection.length) {
        msg.send(`Next train(s) from: ${from} to ${to}:`);
        let i = 0;

        return (() => {
          const result = [];
          while (i < json.connection.length) {
            const connection = json.connection[i];
	        console.log(connection);
            if (i < 4) {
              let response = `   [ ${connection.departure.vehicle.split(".")[2].trim().toUpperCase()} ] ${connection.departure.station} to ${connection.arrival.station}`;
              if (connection.departure.platform.length) {
                response += ` at platform ${connection.departure.platform}`;
                }
              response += ` is at ${showtime(connection.departure.time)}`;
              if (connection.departure.delay>0) {
                  var delay=connection.departure.delay;
                  if (delay > 60 ) {
                    delay=Math.round(delay/60);
                    response += ` (+${delay}m)`;
                  } else {
                    response += ` (+${delay}s)`;
                  }
              } else {
                response += ` (On Time)`;
              }
              msg.send(response);
            }
            result.push(i++);
          }
          return result;
        })();
      } else {
        return msg.send("Sorry, there's no train today");
      }
    })
  ;

  const getStation = (msg, query, callback) =>
    robot.http('http://irail.be/stations/NMBS/${encodeURIComponent(query)}').query({
      format: 'json'
    }).get()(function(err, res, body) {
      console.log(body);
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
    let user = md5(msg.envelope.user.id);
    if (from.length === 0) { from = robot.brain.get(user+'_DEFAULT_STATION'); }
    return getTrainTimes(msg, from, to);
  });

  robot.respond(/set default train_station (.+)/i, function(msg) {
    // console.log(msg);
    let station = msg.match[1];
    let user = md5(msg.envelope.user.id);
    if (station.length > 0) {
        robot.brain.set(user+'_DEFAULT_STATION',station);
    }
    return msg.send(`default station set to: ${station}`);
  });

  robot.respond(/get default train_station/i, function(msg) {
    let user = md5(msg.envelope.user.id);
    let station = 'NULL';
    if (user.length > 0) {
        station = robot.brain.get(user+'_DEFAULT_STATION');
    }
    return msg.send(`current default station is : ${station}`);
  });

  return robot.respond(/trains to (.+)/i, function(msg) {
    let user = md5(msg.envelope.user.id);
    const fromCode = robot.brain.get(user+'_DEFAULT_STATION');
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

/**
 * Convert seconds to time string (hh:mm:ss).
 *
 * @param Number s
 *
 * @return String
 */
function showtime(s) {
   var moment = require('moment-timezone');

   return moment.unix(s).tz('CET').format('YYYY-MM-DD HH:mm:ss');
}

