// import React, { useEffect, useState } from 'react'
// import Navbar from '../Components/Navbar.jsx'
// import { useNavigate } from 'react-router-dom'
// import { onAuthStateChanged } from 'firebase/auth'
// import NavbarBlow from '../Components/NavbarBlow'
// import { auth, db, getAllData } from '../config/firebase/FirebaseMethod.js'
// import { collection, getDocs, orderBy, query } from 'firebase/firestore'
// // import {  getBlogs } from './Dashboard.jsx' // Adjust this as needed

// const Home = () => {
//   const [UserImage, setUserImage] = useState(null);
//   const [UserFullName, setUserFullName] = useState(null);
//   let [CheckUser, setCheckUser] = useState(null)
//   let [CheckUserDataForBlog, setCheckUserDataForBlog] = useState([])
//   const [blogs, setBlogs] = useState([]) // To store the blog posts
//   const navigate = useNavigate()

//   useEffect(() => {
//     // Check if the user is logged in
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         // console.log(user);

//         setCheckUser(true)
//       } else {
//         setCheckUser(false)
//       }
//     })

//     // Fetch blog posts from Firebase
//     GetDataFromFirestore();
//   }, [])

//   async function GetDataFromFirestore() {
//     try {
//       // Fetch blogs data with orderBy
//       const blogsData = await getAllData("blogs", orderBy("time", "asc"));
//       const blogsArray = blogsData;  // Use the blogsData directly since it's already an array

//       // Fetch users data
//       const usersQuerySnapshot = await getDocs(collection(db, "users"));
//       const usersArray = [];
//       usersQuerySnapshot.forEach((doc) => {
//         usersArray.push(doc.data());
//       });

//       setBlogs(blogsArray);  // Set blogs data in state
//       setCheckUserDataForBlog(usersArray);  // Set users data in state

//       console.log("Blogs:", blogsArray);
//       console.log("Users:", usersArray);
//     } catch (error) {
//       console.error("Error fetching data from Firestore: ", error);
//     }
//   }




//   return (
//     <React.Fragment>
//       <Navbar
//         Login={!CheckUser ? 'Login' : ''}
//       />
//       <NavbarBlow PageName='Good Morning Readers!' />
//       <div className="blogs-container">
//         <h1>All Blogs</h1>
//         <div className="sm:mt-10 mt-5 w-full px-5">
//           {blogs.length > 0 ? (
//             blogs.map((blog, index) => {
//               const user = CheckUserDataForBlog.find(user => user.id === blog.Uid);
//               return (
//                 <div key={index} className="bg-white mt-10 mb-10 shadow-md rounded-lg p-6 w-[95%] sm:w-[80%]">
//                   <div className="flex items-center space-x-4">
//                     <img
//                       src={user.profileImage} // Agar user data mile toh uska image lagaye, warna default image
//                       alt="Author Image"
//                       className="w-14 object-cover h-14 rounded-full"
//                     />
//                     <div>
//                       <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
//                       <p className="text-sm text-gray-500">
//                         {user.fullName} - {blog.time.toDate().toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="mt-4 text-gray-700">
//                     {blog.BlogDescription}
//                   </p></div>
//               );
//             })
//           ) : (
//             <p className="text-center text-gray-600">No blogs found.</p>
//           )}
//         </div>
//       </div>
//     </React.Fragment>
//   )
// }

// export default Home



import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar.jsx'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import NavbarBlow from '../Components/NavbarBlow'
import { auth, db, getAllData } from '../config/firebase/FirebaseMethod.js'
import { collection, getDocs, orderBy } from 'firebase/firestore'

const Home = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  let [CheckUser, setCheckUser] = useState(null)
  let [CheckUserDataForBlog, setCheckUserDataForBlog] = useState([])
  const [blogs, setBlogs] = useState([]) // To store the blog posts
  const [loading, setLoading] = useState(true) // State for loading spinner
  const navigate = useNavigate()

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
    GetDataFromFirestore();
  }, [])

  async function GetDataFromFirestore() {
    try {
      // Fetch blogs data with orderBy
      const blogsData = await getAllData("blogs", orderBy("time", "asc"));
      const blogsArray = blogsData;

      // Fetch users data
      const usersQuerySnapshot = await getDocs(collection(db, "users"));
      const usersArray = [];
      usersQuerySnapshot.forEach((doc) => {
        usersArray.push(doc.data());
      });

      setBlogs(blogsArray);  // Set blogs data in state
      setCheckUserDataForBlog(usersArray);  // Set users data in state
    } catch (error) {
      console.error("Error fetching data from Firestore: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check your Internet connection'
      });
    } finally {
      setLoading(false); // Set loading to false after data is fetched
    }
  }

  return (
    <React.Fragment>
      <Navbar
        Login={!CheckUser ? 'Login' : ''}
      />
      <NavbarBlow PageName='Good Morning Readers!' />
      <div className="blogs-container">
        <h1 className='font-semibold sm:text-[2rem] ml-2 sm:ml-24 text-[1.5rem] sm:mb-5 mb-0 sm:mt-5 mt-2'>All Blogs</h1>
        <div className="sm:mt-10 mt-5 m-auto w-full px-5">
          {loading ? (
            // Show Flowbite spinner while loading
            <div className=" flex justify-center items-center">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-24 h-23 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>

            </div>
          ) : blogs.length > 0 ? (
            blogs.map((blog, index) => {
              const user = CheckUserDataForBlog.find(user => user.id === blog.Uid);
              return (
                <div key={index} className="bg-white m-auto mt-10 mb-10 shadow-md rounded-lg p-6 w-[95%] sm:w-[80%]">
                  <div className="flex items-center space-x-4">
                    <img
                      src={user?.profileImage || '/default-profile.png'} // Fallback to default image if no user data
                      alt="Author Image"
                      className="w-14 object-cover h-14 rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                      <p className="text-sm text-gray-500">
                        {user?.fullName || 'Unknown Author'} - {blog.time.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    {blog.BlogDescription}
                  </p>
                </div>
              );
            })
          ) : (
            // Show this message if no blogs are found
            <p className="text-center text-gray-600">No blogs found.</p>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default Home
