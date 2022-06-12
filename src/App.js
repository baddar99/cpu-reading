import React from 'react';
import { io } from 'socket.io-client';
import ReactApexChart from 'react-apexcharts';
import Container from '@mui/material/Container';
import { chartInit } from './intialChart';

const App = () => {
  const [chartData, setChartData] = React.useState(chartInit);

  React.useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => console.log(socket.id));
    socket.on('connect_error', () => {
      setTimeout(() => socket.connect(), 5000);
    });
    socket.on('time', dat => {
      setChartData(prevState => {
        return {
          ...prevState,
          series: [
            {
              name: chartData.series[0].name,
              type: chartData.series[0].type,
              data: [...prevState.series[0].data, dat],
            },
          ],
        };
      });
    });
    socket.on('disconnect', () => console.log('server disconnected'));
  }, []);
  return (
    <div className='App'>
      <Container maxWidth='lg'>
        <ReactApexChart options={chartData} series={chartData.series} />
      </Container>
    </div>
  );
};

export default App;
