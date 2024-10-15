import React, { useEffect, useState } from 'react';
import NavbarBlow from '../Components/NavbarBlow';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth, db } from '../config/firebase/FirebaseMethod';
import Navbar from '../Components/Navbar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Swal from 'sweetalert2';

const Profile = () => {
  const navigate = useNavigate();

  let [Submitting, setSubmitting] = useState(false);
  let [UserImage, setUserImage] = useState(null);
  let [UserFullName, setUserFullName] = useState(null);
  let [UserEmail, setUserEmail] = useState(null);
  let [oldPassword, setOldPassword] = useState("");
  let [newPassword, setNewPassword] = useState("");
  let [repeatPassword, setRepeatPassword] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        let GetUserDataFromFirebase = async () => {
          try {
            const userQuery = query(
              collection(db, "users"),
              where("id", "==", user.uid)
            );
            const querySnapshot = await getDocs(userQuery);

            querySnapshot.forEach((doc) => {
              // console.log('User data found:', doc.data());
              setUserImage(doc.data().profileImage);
              setUserFullName(doc.data().fullName);
              setUserEmail(doc.data().email);
            });
          } catch (error) {
            console.log("Error getting user document: ", error);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Please check your internet connection'
            });
          }
        };

        GetUserDataFromFirebase();
      } else {
        navigate('/login');
      }
    });
  }, []);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !repeatPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Fill all the input fields',
      });
      return; // Return early here if inputs are invalid
    }

    if (newPassword !== repeatPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'New passwords do not match.',
      });
      return; // Early return if passwords do not match
    }

    try {
      setSubmitting(true); // Start the loading state

      const user = auth.currentUser;

      if (user) {
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to update password. The old password you entered is incorrect.',
      });
    } finally {
      setSubmitting(false); // Always set submitting to false when the process completes
      oldPassword.current.value = ''
      newPassword.current.value = ''
      repeatPassword.current.value = ''
    }
  };

  return (
    <React.Fragment>
      <Navbar />
      <NavbarBlow PageName="Profile" />
      <div className="max-w-5xl mt-10 sm:ml-20 ml-5 mb-5 p-6 sm:mr-5 md:mr-5 mr-5 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-start mt-2">
          <h1 className="text-2xl font-semibold text-center mb-3 text-gray-700">Your Profile</h1>
          <img
            src={UserImage}
            alt="Profile"
            className="w-52 object-cover shadow-xl h-52 rounded-2xl mb-2"
          />
          <h2 className="text-xl font-medium text-gray-800">{UserFullName}</h2>
          <h2 className="text-xl font-medium text-gray-800">{UserEmail}</h2>
          <div className="w-full mt-6">
            <input
              required
              type="password"
              id="old-password"
              placeholder="Old Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              required
              type="password"
              id="new-password"
              placeholder="New Password"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              required
              type="password"
              id="repeat-password"
              placeholder="Repeat Password"
              className="w-full p-2 mb-6 border border-gray-300 rounded-md"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={Submitting}
              onClick={handleUpdatePassword}
              className={`flex items-center justify-center w-full py-2 rounded-lg transition duration-300 ${Submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {Submitting ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12c0-1.5.4-2.9 1.1-4.1l1.5 1.5C6.9 10.3 6 11.1 6 12s.9 1.7 2.6 2.6l-1.5 1.5C4.4 14.9 4 13.5 4 12zm16 0c0 1.5-.4 2.9-1.1 4.1l-1.5-1.5C17.1 13.7 18 12.9 18 12s-.9-1.7-2.6-2.6l1.5-1.5C19.6 9.1 20 10.5 20 12z"
                  ></path>
                </svg>
              ) : (
                'Update Password'
              )}
              {Submitting && <span className="ml-2">Processing...</span>}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;
