import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar.jsx'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import NavbarBlow from '../Components/NavbarBlow'
import { auth, db, getAllData } from '../config/firebase/FirebaseMethod.js'
import { collection, getDocs, orderBy } from 'firebase/firestore'
import Spinner from '../Components/Spinner.jsx'

const Home = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  let [CheckUser, setCheckUser] = useState(null)
  let [GetUserDataFromFirebase, setGetUserDataFromFirebase] = useState([])
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
      console.log(blogsArray);


      // Fetch users data
      const usersQuerySnapshot = await getDocs(collection(db, "users"));
      const usersArray = [];
      usersQuerySnapshot.forEach((doc) => {
        usersArray.push(doc.data());
      });

      setBlogs(blogsArray);  // Set blogs data in state
      setGetUserDataFromFirebase(usersArray);  // Set users data in state
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
  };

  let greeting;
  const App = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good Morning Readers!';
    } else if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good Noon Readers!';
    } else if (currentHour >= 17 && currentHour < 21) {
      greeting = 'Good Evening Readers!';
    } else {
      greeting = 'Good Night Readers!';
    }

  }
  App()

  function userblog(Uid) {
    navigate(`user/${Uid}`)
    
  }

  return (
    <React.Fragment>
      <Navbar
        Login={!CheckUser ? 'Login' : ''}
      />
      <NavbarBlow PageName={greeting} />
      <div className="blogs-container">
        <h1 className='font-semibold sm:text-[2rem] ml-2 sm:ml-24 text-[1.5rem] sm:mb-5 mb-0 sm:mt-5 mt-2'>All Blogs</h1>
        <div className="sm:mt-10 mt-5 m-auto w-full px-5">
          {loading ? (
            <Spinner/>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => {
              const user = GetUserDataFromFirebase.find(user => user.id === blog.Uid);
              return (
                <div key={blog.documentId} className="bg-white m-auto mt-10 mb-10 border rounded-lg p-6 pb-4 w-[95%] sm:w-[80%]">
                  <div className="flex space-x-1">
                    <img
                      src={user.profileImage} // Fallback to default image if no user data
                      alt="Author Image"
                      className="w-14 object-cover h-14 rounded-xl"
                    />
                    <div>
                      <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                      <p className="text-sm text-gray-500">
                        {user.fullName} - {blog.time.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[0.9rem] text-gray-700">
                    {blog.BlogDescription}
                  </p>
                  <p className='mt-3 sm:mt-5 inline-block text-[#7749F8] hover:underline cursor-pointer' onClick={()=>userblog(blog.Uid)}>see all from this user</p>
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
