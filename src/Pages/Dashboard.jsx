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
  const [loading, setLoading] = useState(false);
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
    setLoading(true)
    const userQuery = query(collection(db, 'blogs'), where('Uid', '==', uid), orderBy('time'));
    try {
      const querySnapshot = await getDocs(userQuery);
      let userBlogs = [];
      querySnapshot.forEach((doc) => {
        userBlogs.push({ ...doc.data(), id: doc.id });
      });
      setBlogs(userBlogs);
    } catch (error) {
      alert(error)
    } finally {
      setLoading(false)
    }
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

      <div className='flex items-center sm:items-start flex-col justify-start sm:pl-[100px] pl-0  min-h-screen'>
        <div className='rounded border flex items-center flex-col justify-center gap-5 max-h-96 bg-white w-[95%] sm:w-[80%] mt-20 '>
          <input
            required
            type="text"
            placeholder='placeholder'
            ref={MainBlogTitle}
            id="small-input"
            className="mt-10 block w-[80%] p-2 text-gray-900 border border-gray-300 rounded-lg sm:text-[1rem]  text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <textarea
            id="message"
            required
            rows={4}
            ref={MainBlogDescription}
            className="block sm:p-2 p-2.5 sm:text-[1rem] text-sm w-[80%] text-gray-900  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
          {loading ?
            (<div role="status" className="w-full flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
            ) : blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <div key={index} className="bg-white mt-10 mb-10 border rounded-lg p-6 w-[95%] sm:w-[80%]">
                  <div className="flex space-x-1">
                    <img
                      src={UserImage}
                      alt="Author"
                      className="w-[56px] h-[56px] rounded-xl object-cover"
                    />
                    <div>
                      <div className='max-w-[20rem]'>
                        <h2 className="text-xl font-semibold">{blog.BlogTitle}</h2>
                      </div>
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
              <p className="text-center text-2xl font-bold text-gray-600">No blogs found.</p>
            )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
