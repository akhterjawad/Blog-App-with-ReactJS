import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, sendData } from '../config/firebase/FirebaseMethod';
import Swal from 'sweetalert2';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import Navbar from '../Components/Navbar';
import NavbarBlow from '../Components/NavbarBlow';
import Spinner from '../Components/Spinner';

const Dashboard = () => {
  const [UserImage, setUserImage] = useState(null);
  const [UserFullName, setUserFullName] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogs, setBlogs] = useState([]);
  // const [isEditing, setIsEditing] = useState(false);
  // const [editIndex, setEditIndex] = useState(null);
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
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please check your internet connection'
      });
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

  const updateBlog = async (index) => {
    const blogToUpdate = blogs[index];
    if (!blogToUpdate) {
      console.error('Blog not found at index:', index);
      return;
    }
  
    // Function to get updated title
    async function ForUpdateTitleValue() {
      try {
        const inputValue = blogToUpdate.BlogTitle;
  
        const { value: updatedTitle } = await Swal.fire({
          title: "Enter Title",
          input: "text",
          inputLabel: "Your Title",
          inputPlaceholder: "Type your title here...",
          inputValue, // Set the default input value to the old title
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return "You need to write something!";
            }
          },
        });
  
        return updatedTitle; // Return the updated title
      } catch (error) {
        console.error("Error getting updated title:", error);
        return null; // Return null if there was an error
      }
    }
  
    const updatedTitle = await ForUpdateTitleValue();
  
    // Check if user canceled the title prompt
    if (updatedTitle === null) {
      console.log("Update canceled by user for title.");
      return;
    }
  
    // Function to get updated description
    async function ForUpdateDescriptionValue() {
      try {
        const inputValue = blogToUpdate.BlogDescription;
  
        const { value: updatedDescription } = await Swal.fire({
          input: "textarea",
          inputLabel: "Message",
          inputValue, // Set the default value to the current description
          inputAttributes: {
            "aria-label": "Type your message here",
          },
          showCancelButton: true,
        });
  
        return updatedDescription; // Return the updated description
      } catch (error) {
        console.error("Error getting updated description:", error);
        return null; // Return null in case of error
      }
    }
  
    const updatedDescription = await ForUpdateDescriptionValue(); // Await the result
  
    // Check if user canceled the description input
    if (updatedDescription === null) {
      console.log("Update canceled by user for description.");
      return;
    }
  
    // Save the updated blog
    saveUpdatedBlog(updatedTitle, updatedDescription, index);
  };
  
  const saveUpdatedBlog = async (updatedTitle, updatedDescription, index) => {
    const blogToUpdate = blogs[index];
    if (!blogToUpdate) {
      console.error("No blog found at this index:", index);
      return;
    }
  
    const updatedFields = {};
    if (updatedTitle !== blogToUpdate.BlogTitle) {
      updatedFields.BlogTitle = updatedTitle;
    }
    if (updatedDescription !== blogToUpdate.BlogDescription) {
      updatedFields.BlogDescription = updatedDescription;
    }
  
    // Check if there are actually fields to update
    if (Object.keys(updatedFields).length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Nothing to update",
        text: "The title and description are unchanged.",
      });
      return;
    }
  
    try {
      const blogDoc = doc(db, "blogs", blogToUpdate.id);
      console.log("Updating blog document:", blogDoc.id);
  
      await updateDoc(blogDoc, updatedFields); // Only update the fields that changed
  
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog, i) =>
          i === index ? { ...blog, ...updatedFields } : blog
        )
      );
      console.log("Blog updated");
    } catch (error) {
      console.error("Error updating blog:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while updating the blog!",
      });
    }
  };
  
  

  return (
    <React.Fragment>
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
              onClick={addBlogToFireStore}
              disabled={isSubmitting}
              className={`flex items-center justify-center w-32 mb-10 py-2 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
              {isSubmitting ? 'Processing...' : 'Publish Blog'}
            </button>
          </div>
        </div>

        <h1 className='font-semibold sm:text-[2rem] self-start ml-2 sm:ml-0 text-[1.5rem] sm:mb-5 mb-0 sm:mt-5 mt-2'>My Blogs</h1>

        {/* Render the list of blogs */}
        <div className="sm:mt-10 mt-5 w-full px-5">
          {loading ?
            (<Spinner/>) : blogs.length > 0 ? (
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
                  <p className="mt-4 text-[0.9rem] text-gray-700">
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
    </React.Fragment>
  );
};

export default Dashboard;
