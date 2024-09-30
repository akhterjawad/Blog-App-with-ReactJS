// import React, { useEffect, useState } from 'react'
// import Navbar from '../Components/Navbar.jsx'
import NavbarBlow from '../Components/NavbarBlow'
// import { useNavigate } from 'react-router-dom'
// import { onAuthStateChanged } from 'firebase/auth'
// import { auth, loginUser } from '../config/firebase/FirebaseMethod'

// const Home = () => {
//   const navigate = useNavigate()
//   let [CheckUser, setCheckUser] = useState(null)
//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // setCheckUser(user)
//         console.log(user);

//         setCheckUser(true)

//         return
//       }
//       setCheckUser(false)

//       // navigate('/login')
//     })
//   }, [])
//   return (
//     <>

//       <Navbar
//         // Dashboard={CheckUser ? 'Dashboard' : ''}
//         // Profile={CheckUser ? 'Profile' : ''}
//         // Logout={CheckUser ? 'Logout' : ''}
//         Login={!CheckUser ? 'Login' : ''}
//       />

//       <NavbarBlow PageName='Good Morning Readers!' />
//       <h1></h1>
//     </>
//   )
// }

// export default Home


import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar.jsx'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase/FirebaseMethod.js'
// import {  getBlogs } from './Dashboard.jsx' // Adjust this as needed

const Home = () => {
  const navigate = useNavigate()
  let [CheckUser, setCheckUser] = useState(null)
  const [blogs, setBlogs] = useState([]) // To store the blog posts

  useEffect(() => {
    // Check if the user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCheckUser(true)
      } else {
        setCheckUser(false)
      }
    })

    // Fetch blog posts from Firebase
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const blogData = await getBlogs() // Replace this with your method to fetch blogs
      const sortedBlogs = blogData.sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
      setBlogs(sortedBlogs)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    }
  }

  return (
    <>
      <Navbar
        Login={!CheckUser ? 'Login' : ''}
      />


       <NavbarBlow PageName='Good Morning Readers!' />
      <div className="blogs-container">
        <h1>All Blogs</h1>
        {blogs.length > 0 ? (
          blogs.map((blog, index) => (
            <div key={index} className="blog-card">
              <h2>{blog.title}</h2>
              <p>By {blog.author} - {new Date(blog.date).toDateString()}</p>
              <p>{blog.description}</p>
              <a href={blog.link}>Read more</a>
            </div>
          ))
        ) : (
          <p>No blogs available</p>
        )}
      </div>
    </>
  )
}

export default Home
