import React from 'react'

const NavbarBlow = ({ PageName }) => {
    return (
        <React.Fragment>
            <div className='border bg-white mt-8'>
                <h1 className=' sm:ml-24 m-6 ml-10 font-bold text-[1.7rem] sm:text-[2.3rem]'>{PageName}</h1>
            </div>
        </React.Fragment>
    )
}

export default NavbarBlow
