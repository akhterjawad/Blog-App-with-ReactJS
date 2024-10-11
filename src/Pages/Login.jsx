import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { loginUser } from '../config/firebase/FirebaseMethod';
import { Link, useNavigate } from 'react-router-dom';
import NavbarBlow from '../Components/NavbarBlow';
import Navbar from '../Components/Navbar';
import Swal from 'sweetalert2';

const Login = () => {
  // const [isDropdownOpen, setDropdownOpen] = useState(false);

  // const toggleDropdown = () => {
  //   setDropdownOpen(!isDropdownOpen);
  // };

  const [isSubmitting, setIsSubmitting] = useState(false); // Start with false

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const loginUserFromFirebase = async (data) => {
    setIsSubmitting(true);
    console.log(data);
  
    try {
      const userLogin = await loginUser({
        email: data.email,
        password: data.password,
      });
      console.log(userLogin);
      navigate('/');
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Check your email and Password',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <>
    <Navbar/>
      
      <NavbarBlow PageName='Login' />
      <div className="flex items-center justify-center pt-[5rem]">
        <div className="w-full max-w-sm p-6 m-3 bg-white shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
          <form onSubmit={handleSubmit(loginUserFromFirebase)} className="space-y-4">
            <div>
              <input
              required
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1 block">This field is required</span>
              )}
            </div>

            <div>
              <input
              required
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1 block">This field is required</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center w-full py-2 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
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
                'Login'
              )}
              {isSubmitting && <span className="ml-2">Processing...</span>}
            </button>
            <center>
              <Link to="/register" className=' w-32 flex  justify-center'><p className="inline text-blue-500 text-center mt-2 font-semibold  hover:underline ">Not a user..?</p></Link>
            </center>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
