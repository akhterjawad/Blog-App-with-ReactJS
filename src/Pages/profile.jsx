import React, { useEffect, useState } from 'react'
import NavbarBlow from '../Components/NavbarBlow'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../config/firebase/FirebaseMethod'
import Navbar from '../Components/Navbar'
import { collection, getDocs, query, where } from 'firebase/firestore'
const profile = () => {

  const navigate = useNavigate()
  let [CheckUser, setCheckUser] = useState(null)
  let [UserImage, setUserImage] = useState(null)
  let [UserFullName, setUserFullName] = useState(null)
  let [UserEmail, setUserEmail] = useState(null)
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
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

        GetUserDataFromFirebase();
      } else {
        navigate('/login');
      }
    });
  }, []);
  return (
    <div>
      <Navbar />
      <NavbarBlow PageName='Profile' />
      <div className="max-w-5xl mt-10 ml-20 p-6 bg-white rounded-lg shadow-md">
        <div className="flex  flex-col items-start mt-2">
          <h1 className="text-2xl font-semibold text-center mb-3 text-gray-700">Profile</h1>
          <img
            src={UserImage}
            alt="Profile"
            className="w-32 object-cover shadow-xl h-32 rounded-2xl mb-2"
          />
          <h2 className="text-xl font-medium text-gray-800">{UserFullName}</h2>
          <h2 className="text-xl font-medium text-gray-800">{UserEmail}</h2>
          <div className="w-full mt-6">
            
            <input
              type="password"
              id="old-password"
              placeholder="Old Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
            />

           
            <input
              type="password"
              id="new-password"
              placeholder="New Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
            />

            
            <input
              type="password"
              id="repeat-password"
              placeholder="Repeat Password"
              className="w-full p-2 mb-6 border border-gray-300 rounded-md"
            />

            <button className="w-full p-2 text-white bg-purple-600 rounded-md hover:bg-purple-500">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default profile
