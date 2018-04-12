/*jslint node: true */

// Description:
//  Get Belgian Rail live information
//
// Dependencies:
//  Api access to iRail:
//  https://api.irail.be/connections/?from=Weerde&to=Brussel-Schuman&format=json
//
// Configuration:
//  HUBOT_DEFAULT_STATION - set the default from station (nearest to your home/office)
//
// Commands:
//  HUBOT trains from <departure station> to <arrival station>` - Show the next trains from one station to the other
//  HUBOT trains to <arrival station>` - Show the next trains from the default station to the arrival station
//  HUBOT trains to <arrival station>` - Show the next trains from the default station to the arrival station
//  HUBOT set default train_station <station>` - Set the default station and save it to the brain
//  HUBOT get default train_station            - Get the default station from the brain
//
// Notes:
//   Inspired by the work of JamieMagee and John Hamelink
//   reworked for Belgium railway using iRail API
//
// Author:
//  Glenn Plas <glenn@bitles.be>

'use strict';


module.exports = function(robot) {
  var md5 = require('md5');
  var moment = require('moment-timezone');

  const getTrainTimes = (msg, from, to) =>
    robot.http("https://api.irail.be/connections/?").query({
      from: from,
      to: to,
      format: 'json'
    }).get()(function(err, res, body) {
      const json = JSON.parse(body);
	    //console.log(json);
      if (json.connection.length) {
        msg.send(`Next train(s) from: ${from} to ${to}:`);
        let i = 0;

        return (() => {
          const result = [];
          while (i < json.connection.length) {
            const connection = json.connection[i];
	        //console.log(connection);
            if (i < 4) {
              let response = `   [ ${connection.departure.vehicle.split(".")[2].trim().toUpperCase()} ] ${connection.departure.station} to ${connection.arrival.station}`;
              if (connection.departure.platform.length) {
                response += ` at platform ${connection.departure.platform}`;
              }
              var departure = moment(connection.departure.time).tz('CET').format('HH:mm:ss');
              response += ` departs ${showtime(departure)}`;
              // delay
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
            
              var date = new Date(null);
              date.setSeconds(connection.duration); 
              var duration=date.toISOString().substr(11, 8);
              response += ` = Travel time: ${duration}`;

              // Check to see if we have a direct connection or not by counting the vias
              if (connection.vias) {
                  var vias = connection.vias.number;
                  //console.log('total: '+vias);
                if (vias>0) {
                    response += ` ( ${vias} Ch )`;
                } else {
                    response += ` ( D )`;
                }
              } else {
                response += ` ( D )`;
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
    const from = robot.brain.get(user+'_DEFAULT_STATION');
    let to = msg.match[1];
    return getTrainTimes(msg, from, to);
  });

  const getStation = (msg, query, callback) =>
    robot.http('http://irail.be/stations/NMBS/${encodeURIComponent(query)}').query({
      format: 'json'
    }).get()(function(err, res, body) {
      //console.log(body);
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

