const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const os = require('os');
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
}); //in case server and client run on different urls

io.on('connection', socket => {
  console.log('client connected: ', socket.id);

  socket.join('cpu-reading');

  socket.on('disconnect', reason => {
    console.log(reason);
  });
});

setInterval(async () => {
  const cpuPercentage = await calcLastMeasurement();
  io.to('cpu-reading').emit('time', cpuPercentage);
}, 20000);

server.listen(PORT, err => {
  if (err) console.log(err);
  console.log('Server running on Port ', PORT);
});

//Create function to get CPU information
const cpuAverage = () => {
  //Initialise sum of idle and time of cores and fetch CPU info
  let totalIdle = 0,
    totalTick = 0;
  const cpus = os.cpus();

  //Loop through CPU cores
  for (let i = 0, len = cpus.length; i < len; i++) {
    //Select CPU core
    const cpu = cpus[i];

    //Total up the time in the cores tick
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }

    //Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  //Return the average Idle and Tick times
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
};

//Grab first CPU Measure
const startMeasure = cpuAverage();

const calcLastMeasurement = async () => {
  const result = await lastMeasurement();

  return result;
};

//Set delay for second Measure
const lastMeasurement = () => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(function () {
      //Grab second Measure
      const endMeasure = cpuAverage();

      //Calculate the difference in idle and total time between the measures
      const idleDifference = endMeasure.idle - startMeasure.idle;
      const totalDifference = endMeasure.total - startMeasure.total;

      //Calculate the average percentage CPU usage
      const percentageCPU = 100 - ~~((100 * idleDifference) / totalDifference);

      //Output result to console
      resolve(percentageCPU);
    }, 100);
  });
  return promise;
};
