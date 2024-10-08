import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db, getData, signOutUser } from '../config/firebase/FirebaseMethod'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'

let Navbar = ({ Home, Dashboard, Profile, Logout, Login, Register }) => {
  let [UserImage, setUserImage] = useState(null)
  // let [Uid, setUid] = useState(null)
  let [UserFullName, setUserFullName] = useState(null)
  let [UserEmail, setUserEmail] = useState(null)
  let [isDropdownOpen, setDropdownOpen] = useState(false);
  let [LoginUser, setLoginUser] = useState(null);

  let toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  let navigate = useNavigate()
  useEffect(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log(user);
      setLoginUser(true);
      // setUid(user.uid);

      // Uid set hone ka wait karte hain aur phir data fetch karte hain
      let GetUserDataFromFirebase = async () => {
        try {
          // Create a query to find the user document where id matches user.uid
          const userQuery = query(
            collection(db, "users"),
            where("id", "==", user.uid)
          );
          const querySnapshot = await getDocs(userQuery);

          querySnapshot.forEach((doc) => {
            console.log('User data found:', doc.data());
            setUserImage(doc.data().profileImage);
            setUserFullName(doc.data().fullName);
            setUserEmail(doc.data().email);
          });
        } catch (error) {
          console.log("Error getting user document: ", error);
        }
      };

      GetUserDataFromFirebase(); // Ab function call karte hain
    } else {
      setLoginUser(false);
    }
  });
}, []);

  let logoutUser = async () => {
    let user = await signOutUser();
    // setIsUser(false)
    console.log(user);
    navigate('/login')
  }
  return (
    <>

      <nav className="bg-[#7749F8] sm:p-0 p-1 flex flex-wrap justify-between items-center">
        <Link to="/" className="text-white sm:ml-24 ml-5 sm:text-[1.4rem] text-[1.1rem] font-bold hover:bg-[#5628F6]  rounded-lg transition duration-300 sm:px-2 px-0 py-0  sm:py-1">Personal Blogging App</Link>
        <div className="flex justify-center items-center font-semibold sm:mr-12 mr-5 ">
          {LoginUser ?
            <div className="bg-white border-gray-200 dark:bg-gray-900">
              <div className="max-w-screen-xl flex items-center justify-end bg-[#7749F8]">
                <div className="relative text-center space-x-3 rtl:space-x-reverse">
                  <button
                    type="button"
                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                    id="user-menu-button"
                    aria-expanded={isDropdownOpen ? "true" : "false"}
                    onClick={toggleDropdown}
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className=" w-8 h-8 rounded-full object-cover"
                      src={UserImage}
                      alt="user photo"
                    />
                  </button>
                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 z-50 mt-2 w-48 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
                      id="user-dropdown"
                    >
                      <div className="px-4 py-3">
                        <span className="block text-sm text-gray-900 dark:text-white">
                          {UserFullName}
                        </span>
                        <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                          {UserEmail}
                        </span>
                      </div>
                      <ul className="py-2" aria-labelledby="user-menu-button">
                        <li>
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{Dashboard}Dashboard</Link>
                        </li>
                        <li>
                          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{Profile}Your Profile</Link>
                        </li>
                        <li>
                          <h5
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                            onClick={logoutUser}
                          >
                            {Logout}Logout
                          </h5>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            : <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
          }
          <Link to="/login" className="text-white sm:px-2 px-0 py-0  sm:py-1 hover:bg-[#5628F6]  rounded-lg transition duration-300">{Login}</Link>

          <Link to="/register" className="text-white sm:px-2 px-0 py-0  sm:py-1 hover:bg-[#5628F6]  rounded-lg transition duration-300">{Register}</Link>

        </div>
      </nav>
    </>
  )
}

export default Navbar