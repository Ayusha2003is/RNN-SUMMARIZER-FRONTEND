import React, { useState } from 'react';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Routes
import Home from './Route/Home.jsx';
import Flashcard from './Route/Flashcard.jsx';
import ToDoList from './Route/ToDoList.jsx';
import Login from './Route/Login.jsx';
import SignUp from './Route/SignUp.jsx';
import Dashboard from './Route/Dashboard.jsx';
import UploadSection from './Component/UploadSection.jsx';


// Components
import Layout from './Component/Layout.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Layout>
          <Home isAuthenticated={isAuthenticated} />
        </Layout>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <Layout>
          <Dashboard />
        </Layout>
      ),
    },
    {
      path: '/upload',
      element: (
        <Layout>
          <UploadSection />
        </Layout>
      ),
    },
    {
      path: '/flashcards',
      element: (
        <Layout>
          <Flashcard />
        </Layout>
      ),
    },
    {
      path: '/todolist',
      element: (
        <Layout>
          <ToDoList />
        </Layout>
      ),
    },
    {
      path: '/login',
      element: (
        <Layout>
          <Login setIsAuthenticated={setIsAuthenticated} />
        </Layout>
      ),
    },
    {
      path: '/signup',
      element: (
        <Layout>
          <SignUp setIsAuthenticated={setIsAuthenticated} />
        </Layout>
      ),
    },
    
    {
      path: '*',
      element: (
        <Layout>
          <h1 className="text-center p-10 text-red-600">404 - Page Not Found</h1>
        </Layout>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
