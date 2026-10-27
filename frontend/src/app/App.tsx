import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { DeskProvider } from '../context/DeskContext';
import { router } from './routes';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DeskProvider>
        <RouterProvider router={router} />
      </DeskProvider>
    </ThemeProvider>
  );
};

export default App;
