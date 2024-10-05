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
import { auth, db } from '../config/firebase/FirebaseMethod.js'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
// import {  getBlogs } from './Dashboard.jsx' // Adjust this as needed

const Home = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  const navigate = useNavigate()
  let [CheckUser, setCheckUser] = useState(null)
  let [CheckUserDataForBlog, setCheckUserDataForBlog] = useState([])
  const [blogs, setBlogs] = useState([]) // To store the blog posts

  useEffect(() => {
    // Check if the user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);

        setCheckUser(true)
      } else {
        setCheckUser(false)
      }
    })

    // Fetch blog posts from Firebase
    GetDataFromFirestore();
  }, [])

  async function GetDataFromFirestore() {
    try {
      const blogsQuery = query(collection(db, "blogs"), orderBy("time", "asc"));
      const querySnapshotBlogs = await getDocs(blogsQuery);
      const blogsArray = [];
      querySnapshotBlogs.forEach((doc) => {
        blogsArray.push({ ...doc.data(), id: doc.id });
      });
  
      const usersQuery = collection(db, "users"); // Remove orderBy if "time" doesn't exist
      const querySnapshot = await getDocs(usersQuery); // Fetch users data
      const usersArray = [];
      querySnapshot.forEach((doc) => {
        usersArray.push(doc.data());
      });
  
      setBlogs(blogsArray);
      setCheckUserDataForBlog(usersArray); // Set users data in state
      console.log(usersArray);
      
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
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
        <div className="sm:mt-10 mt-5 w-full px-5">
        {blogs.length > 0 ? (
  blogs.map((blog, index) => {
    // Blog ke sath corresponding user data ko find karen
    const user = CheckUserDataForBlog.find(user => user.userId === blog.userId);

    return (
      <div key={index} className="bg-white mt-10 mb-10 shadow-md rounded-lg p-6 w-[95%] sm:w-[80%]">
        <div className="flex items-center space-x-4">
          <img
            src={user ? user.UserImage : 'defaultImage.png'} // Agar user data mile toh uska image lagaye, warna default image
            alt="Author Image"
            className="w-14 object-cover h-14 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
            <p className="text-sm text-gray-500">
              {user ? user.UserFullName : 'Anonymous'} - {blog.time.toDate().toLocaleString()} {/* Display the timestamp */}
            </p>
          </div>
        </div>
        <p className="mt-4 text-gray-700">
          {blog.BlogDescription}
        </p>

        {/* <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => deleteBlog(index)} className="text-purple-600 hover:underline">Delete</button>
          <button onClick={() => updateBlog(index)} className="text-purple-600 hover:underline">Edit</button>
        </div> */}
      </div>
    );
  })
) : (
  <p className="text-center text-gray-600">No blogs found.</p>
)}

        </div>
      </div>
    </>
  )
}

export default Home
