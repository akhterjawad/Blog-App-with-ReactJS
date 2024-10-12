import React, { useEffect, useState } from 'react'
import NavbarBlow from '../Components/NavbarBlow'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db, getData } from '../config/firebase/FirebaseMethod'
import Navbar from '../Components/Navbar'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import Swal from 'sweetalert2'
const SingleUser = () => {

  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState(null);
  const { uid } = useParams();
  const navigate = useNavigate()
  let [CheckUser, setCheckUser] = useState(null)
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCheckUser(user)
        console.log(user);

        setCheckUser(true)

        return
      }
      setCheckUser(false)
      // navigate('/login')
    })
    if (uid) {
      GetDataFromFirestore(uid); // Call function only if uid exists
    }
  }, [uid, CheckUser]);

  async function GetDataFromFirestore(uid) {
    try {
      // Fetch blogs data with orderBy
      const userQuery = query(
        collection(db, "blogs"),
        where("id", "==", uid)
      );
      const querySnapshot = await getDocs(userQuery);

      querySnapshot.forEach((doc) => {
        console.log('User data found:', doc.data());

        // const blogsArray = blogsData;
        // console.log(blogsArray);
      });

        // Fetch users data
        // const usersQuerySnapshot = await getDocs(collection(db, "users"));
        // const usersArray = [];
        // usersQuerySnapshot.forEach((doc) => {
        //   usersArray.push(doc.data());
        // });

        // setBlogs(blogsArray);  // Set blogs data in state
        // setCheckUserDataForBlog(usersArray);  // Set users data in state
      
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


  return (
    <>
      <Navbar
        Dashboard={CheckUser ? 'Dashboard' : ''}
        Profile={CheckUser ? 'Profile' : ''}
        Logout={CheckUser ? 'Logout' : ''}
        Login={!CheckUser ? 'Login' : ''}
      />
      <div className='border bg-white'>
        <Link to="/">
          <h1 className='cursor-pointer inline-block text-[#7749F8] sm:ml-24 m-6 ml-10 font-bold text-[1.7rem] sm:text-[2.3rem]'><span className=''>{'<'}</span> Back to all blogs</h1>
        </Link>
      </div>

      <div>
        SingleUser
      </div>
    </>
  )
}

export default SingleUser
