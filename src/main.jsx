import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import Login from './Pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SingleUser from './pages/SingleUser.jsx';
import Profile from './pages/profile.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import './index.css'

const router = createBrowserRouter([
  {
    path: '',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'user/:Uid',
        element: <SingleUser />
      },
      {
        path: '*',
        element: <h1 className='text-center font-bold mt-60 text-[4rem]'>Not Found </h1>
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <Layout />
  </RouterProvider>
)