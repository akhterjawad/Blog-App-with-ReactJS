import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, sendData } from '../config/firebase/FirebaseMethod';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import NavbarBlow from '../Components/NavbarBlow';

const Dashboard = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  const MainBlogTitle = useRef();
  const MainBlogDescription = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserBlogs(user.uid);
        const GetUserDataFromFirebase = async () => {
          try {
            const userQuery = query(collection(db, "users"), where("id", "==", user.uid));
            const querySnapshot = await getDocs(userQuery);
            querySnapshot.forEach((doc) => {
              console.log('User data found:', doc.data());
              setUserImage(doc.data().profileImage);
              setUserFullName(doc.data().fullName);
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

  const fetchUserBlogs = async (uid) => {
    const userQuery = query(collection(db, 'blogs'), where('Uid', '==', uid), orderBy('time')); // Add orderBy clause
    const querySnapshot = await getDocs(userQuery);
    let userBlogs = [];
    querySnapshot.forEach((doc) => {
      userBlogs.push({ ...doc.data(), id: doc.id });
    });
    setBlogs(userBlogs);
  };


  const addBlogToFireStore = async () => {
    if (MainBlogTitle.current.value === '' || MainBlogDescription.current.value === '') {
      alert('First fill the inputs');
      return;
    }

    setIsSubmitting(true);
    const newBlog = {
      BlogTitle: MainBlogTitle.current.value,
      BlogDescription: MainBlogDescription.current.value,
      time: Timestamp.now(), // Use Timestamp.now() to get the current timestamp
      Uid: auth.currentUser.uid,
    };

    try {
      await sendData(newBlog, 'blogs');
      setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
      MainBlogTitle.current.value = '';
      MainBlogDescription.current.value = '';
    } catch (error) {
      console.error('Error adding blog: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const deleteBlog = async (index) => {
    const blogToDelete = blogs[index];
    if (!blogToDelete) {
      console.error('Blog not found at index:', index);
      return;
    }

    try {
      await deleteDoc(doc(db, 'blogs', blogToDelete.id));
      setBlogs((prevBlogs) => prevBlogs.filter((_, i) => i !== index));
      console.log('Blog deleted');
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const updateBlog = (index) => {
    const blogToUpdate = blogs[index];
    if (!blogToUpdate) {
      console.error('No blog found at this index:', index);
      return;
    }

    setEditIndex(index);
    MainBlogTitle.current.value = blogToUpdate.BlogTitle;
    MainBlogDescription.current.value = blogToUpdate.BlogDescription;
    setIsEditing(true);
  };

  const saveUpdatedBlog = async () => {
    const updatedTitle = MainBlogTitle.current.value;
    const updatedDescription = MainBlogDescription.current.value;

    if (!updatedTitle || !updatedDescription) {
      alert('Both title and description are required to update!');
      return;
    }

    const blogToUpdate = blogs[editIndex];
    if (!blogToUpdate) {
      console.error('No blog found at this index:', editIndex);
      return;
    }

    try {
      const blogDoc = doc(db, 'blogs', blogToUpdate.id);
      await updateDoc(blogDoc, {
        BlogTitle: updatedTitle,
        BlogDescription: updatedDescription,
      });

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog, i) =>
          i === editIndex ? { ...blog, BlogTitle: updatedTitle, BlogDescription: updatedDescription } : blog
        )
      );
      console.log('Blog updated');
    } catch (error) {
      console.error('Error updating blog:', error);
    } finally {
      setIsEditing(false);
      MainBlogTitle.current.value = '';
      MainBlogDescription.current.value = '';
      setEditIndex(null);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <>
      <Navbar />
      <NavbarBlow PageName="Dashboard" />

      <div className='flex items-center sm:items-start flex-col justify-start sm:pl-[100px] pl-0 bg-gray-50 min-h-screen'>
        <div className='flex items-center flex-col justify-center gap-5 max-h-96 bg-white w-[95%] sm:w-[80%] mt-20 rounded-sm'>
          <input
            required
            type="text"
            ref={MainBlogTitle}
            id="small-input"
            className="mt-10 block w-[80%] p-2 text-gray-900 border border-gray-300 rounded-lg sm:text-[1rem]  text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <textarea
            id="message"
            required
            rows={4}
            ref={MainBlogDescription}
            className="block sm:p-2 p-2.5 sm:text-[1rem] text-sm w-[80%] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Write your thoughts here..."
            defaultValue={""}
          />
          <div className='w-[80%]'>
            <button
              type="submit"
              onClick={isEditing ? saveUpdatedBlog : addBlogToFireStore}
              disabled={isSubmitting}
              className={`flex items-center justify-center w-32 mb-10 py-2 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isSubmitting ? (
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
                isEditing ? 'Save Changes' : 'Publish Blogs'
              )}
              {isSubmitting && <span className="ml-2">Processing...</span>}
            </button>
          </div>
        </div>

        <h1 className='font-semibold sm:text-[2rem] self-start ml-2 sm:ml-0 text-[1.5rem] sm:mb-5 mb-0 sm:mt-5 mt-2 borde'>My Blogs</h1>

        {/* Render the list of blogs */}
        <div className="sm:mt-10 mt-5 w-full px-5">
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <div key={index} className="bg-white mt-10 mb-10 shadow-md rounded-lg p-6 w-[95%] sm:w-[80%]">
                <div className="flex items-center space-x-4">
                  <img
                    src={UserImage}
                    alt="Author Image"
                    className="w-14 object-cover h-14 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                    <p className="text-sm text-gray-500">
                      {UserFullName} - {blog.time.toDate().toLocaleString()} {/* Display the timestamp */}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  {blog.BlogDescription}
                </p>

                <div className="flex justify-end space-x-4 mt-4">
                  <button onClick={() => deleteBlog(index)} className="text-purple-600 hover:underline">Delete</button>
                  <button onClick={() => updateBlog(index)} className="text-purple-600 hover:underline">Edit</button>
                </div>
              </div>

            ))
          ) : (
            <p className="text-center text-gray-600">No blogs found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
