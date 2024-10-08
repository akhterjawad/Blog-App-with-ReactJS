import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, sendData } from '../config/firebase/FirebaseMethod';
import Swal from 'sweetalert2';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import NavbarBlow from '../Components/NavbarBlow';

const Dashboard = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteDisable, setdeleteDisable] = useState(false)
  const MainBlogTitle = useRef();
  const MainBlogDescription = useRef();
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
    const userQuery = query(collection(db, 'blogs'), where('Uid', '==', uid), orderBy('time'));
    const querySnapshot = await getDocs(userQuery);
    let userBlogs = [];
    querySnapshot.forEach((doc) => {
      userBlogs.push({ ...doc.data(), id: doc.id });
    });
    setBlogs(userBlogs);
  };

  const addBlogToFireStore = async () => {
    if (MainBlogTitle.current.value === '' || MainBlogDescription.current.value === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill out the title and description.'
      });
      return;
    }

    setIsSubmitting(true);
    const newBlog = {
      BlogTitle: MainBlogTitle.current.value,
      BlogDescription: MainBlogDescription.current.value,
      time: Timestamp.now(),
      Uid: auth.currentUser.uid,
    };

    try {
      await sendData(newBlog, 'blogs');
      setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
      MainBlogTitle.current.value = '';
      MainBlogDescription.current.value = '';
    } catch (error) {
      console.error('Error sendData of blogs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error sendData of blogs'
      });
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
    setdeleteDisable(true)
    try {
      await deleteDoc(doc(db, 'blogs', blogToDelete.id));
      setBlogs((prevBlogs) => prevBlogs.filter((_, i) => i !== index));
      console.log('Blog deleted');
    } catch (error) {
      console.error('Error deleting blog:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while deleting the blog!'
      });
    } finally {
      setdeleteDisable(false);
    }
  };

  const updateBlog = (index) => {
    setdeleteDisable(true)
    const blogToUpdate = blogs[index];
    if (!blogToUpdate) {
      console.error('Blog not found at index:', index);
      return;
    }

    MainBlogTitle.current.value = blogToUpdate.BlogTitle;
    MainBlogDescription.current.value = blogToUpdate.BlogDescription;
    setIsEditing(true);
    setEditIndex(index);
    // setdeleteDisable(false)
  };

  const saveUpdatedBlog = async () => {
    setdeleteDisable(true)
    const updatedTitle = MainBlogTitle.current.value;
    const updatedDescription = MainBlogDescription.current.value;

    if (!updatedTitle || !updatedDescription) {
      alert('Both title and description are required to update!');
      return;
    }

    if (editIndex === null || editIndex === undefined) {
      console.error('No valid edit index found:', editIndex);
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
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while updating the blog!'
      });
    } finally {
      setIsEditing(false);
      MainBlogTitle.current.value = '';
      MainBlogDescription.current.value = '';
      setEditIndex(null);
      setdeleteDisable(false)
    }
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
            className="mt-10 block w-[80%] p-2 text-gray-900 border border-gray-300 rounded-lg sm:text-[1rem]  text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <textarea
            id="message"
            required
            rows={4}
            ref={MainBlogDescription}
            className="block sm:p-2 p-2.5 sm:text-[1rem] text-sm w-[80%] text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your thoughts here..."
          />
          <div className='w-[80%]'>
            <button
              type="submit"
              onClick={isEditing ? saveUpdatedBlog : addBlogToFireStore}
              disabled={isSubmitting}
              className={`flex items-center justify-center w-32 mb-10 py-2 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isSubmitting ? 'Processing...' : isEditing ? 'Save Changes' : 'Publish Blog'}
            </button>
          </div>
        </div>

        <h1 className='font-semibold sm:text-[2rem] self-start ml-2 sm:ml-0 text-[1.5rem] sm:mb-5 mb-0 sm:mt-5 mt-2'>My Blogs</h1>

        {/* Render the list of blogs */}
        <div className="sm:mt-10 mt-5 w-full px-5">
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <div key={index} className="bg-white mt-10 mb-10 shadow-md rounded-lg p-6 w-[95%] sm:w-[80%]">
                <div className="flex items-center space-x-4">
                  <img
                    src={UserImage}
                    alt="Author"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                    <p className="text-sm text-gray-500">
                      {UserFullName} - {blog.time.toDate().toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  {blog.BlogDescription}
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button onClick={() => deleteBlog(index)} disabled={deleteDisable}
                    className={` ${deleteDisable ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:underline'}`}
                  >{deleteDisable ? 'Processing...' : 'Delete'}</button>
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
