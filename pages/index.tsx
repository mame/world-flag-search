import React from 'react';
import { NextPage } from 'next';
import { AppContextProvider } from '../components/AppContext';
import Meta from '../components/Meta';
import Menu from '../components/Menu';
import Canvas from '../components/Canvas';
import FlagList from '../components/FlagList';

const Home: NextPage = () => {
  return (
    <AppContextProvider>
      <Meta />
      <Menu />
      <div className="main">
        <Canvas canvasWidth={360} canvasHeight={280} />
        <FlagList />
      </div>
    </AppContextProvider>
  );
};

export default Home;
