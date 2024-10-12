import React, { useEffect, useState } from 'react';
import NavbarBlow from '../Components/NavbarBlow';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase/FirebaseMethod';
import Navbar from '../Components/Navbar';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import Swal from 'sweetalert2';
import Spinner from '../Components/Spinner';

const SingleUser = () => {
  let [UserImage, setUserImage] = useState(null);
  let [UserFullName, setUserFullName] = useState(null);
  let [UserEmail, setUserEmail] = useState(null);

  const [blogs, setBlogs] = useState(null);
  const { Uid } = useParams();
  const navigate = useNavigate();
  let [CheckUser, setCheckUser] = useState(null);

  // State to hold user data
  const [userData, setUserData] = useState(null);
  console.log(userData);

  console.log("UID from params:", Uid);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCheckUser(user);
        setCheckUser(true);
        return;
      }
      setCheckUser(false);
    });

    // Fetch user data from Firebase
    const GetUserDataFromFirebase = async (Uid) => {
      try {
        const userQuery = query(collection(db, "users"), where("id", "==", Uid));
        const querySnapshot = await getDocs(userQuery);
        let userDataArray = [];
        querySnapshot.forEach((doc) => {
          userDataArray.push({ ...doc.data(), id: doc.id });
        });
        // Store the user data in state
        setUserData(userDataArray[0]);
        console.log(userDataArray);

      } catch (error) {
        console.log("Error getting user document: ", error);
      }
    };

    // Fetch user blogs from Firebase
    const fetchUserBlogs = async (uid) => {
      const userQuery = query(collection(db, 'blogs'), where('Uid', '==', uid), orderBy('time'));
      try {
        const querySnapshot = await getDocs(userQuery);
        let userBlogs = [];
        querySnapshot.forEach((doc) => {
          userBlogs.push({ ...doc.data() });
        });
        setBlogs(userBlogs);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please check your internet connection'
        });
      }
    };

    GetUserDataFromFirebase(Uid);
    fetchUserBlogs(Uid);
  }, [Uid]);

  return (
    <React.Fragment>
      <Navbar
      // Dashboard={CheckUser ? 'Dashboard' : ''}
      // Profile={CheckUser ? 'Profile' : ''}
      // Logout={CheckUser ? 'Logout' : ''}
      Login={!CheckUser ? 'Login' : ''}
      />
      <div className='border bg-white'>
        <Link to="/">
          <h1 className='cursor-pointer inline-block text-[#7749F8] sm:ml-24 m-6 ml-10 font-bold text-[1.7rem] sm:text-[2.3rem]'>
            <span>{'<'}</span> Back to all blogs
          </h1>
        </Link>
      </div>

      <h1 className='sm:ml-24 ml-5 sm:text-[1.5rem] text-[1.2rem] font-bold mt-5'>All From {userData?.fullName ? userData.fullName : ''} </h1>

      <div className='flex flex-col-reverse sm:flex-row justify-between bg-gray-100'>
        <div className='w-[90%] flex flex-col justify-center items-center  sm:ml-0 ml-5 sm:w-[390rem]'>

          {blogs && userData ? (
            blogs.map((blog, index) => (
              <div key={index} className="bg-white m-auto mt-5 mb-10 border rounded-lg p-6 pb-4 w-[95%] sm:w-[90%]">
                <div className="flex space-x-1">
                  <img
                    src={userData.profileImage} // Use fetched user data
                    alt="Author Image"
                    className="w-14 object-cover h-14 rounded-xl"
                  />
                  <div className=''>
                    <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                    <p className="text-sm text-gray-500">
                      {userData.fullName} - {blog.time.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[0.9rem] text-gray-700">{blog.BlogDescription}</p>
              </div>
            ))
          ) : (
            <div className='flex sm:ml-[40rem] ml-0 sm:mt-20 mt-0 items-center justify-center mb-[30rem]'>
              <Spinner />
            </div>
          )}
        </div>
        {/* Right side: Profile Section */}
        <div className='w-full sm:w-[10 ] p-6 flex flex-col items-center'>
          <div className="flex  flex-col items-end">
            <p className=" text-sm font-bold underline">{userData?.email.split('@')[0]}</p>
          <h2 className="text-xl  font-semibold text-[#7749F8]">
              {userData?.fullName}
            </h2>
            <img
              src={userData?.profileImage}
              alt=""
              className="w-48 h-48 aspect-square object-cover rounded-md mb-4"
            />
            
          </div>
        </div>
      </div>


    </React.Fragment >
  );
};

export default SingleUser;
