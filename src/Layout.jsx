import React from 'react'
import Navbar from './components/Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <React.Fragment>
            {/* <Navbar /> */}
            <Outlet />
        </React.Fragment>
    )
}

export default Layout