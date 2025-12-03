/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormControl, Button } from "react-bootstrap";
import * as client from "../client";

export default function Signup() {
  const [user, setUser] = useState<any>({});
  const dispatch = useDispatch();
  const router = useRouter();
  
  const signup = async () => {
    try {
      const currentUser = await client.signup(user);
      dispatch(setCurrentUser(currentUser));
      router.push("/Account/Profile");
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error?.response?.data?.message || "Signup failed");
    }
  };
  
  return (
    <div className="wd-signup-screen">
      <h1>Sign up</h1>
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={user.username || ""} 
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        className="wd-username mb-2" 
        placeholder="username" 
      />
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={user.password || ""} 
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        className="wd-password mb-2" 
        placeholder="password" 
        type="password"
      />
      <button 
        style={{ maxWidth: "300px" }}
        onClick={signup} 
        className="wd-signup-btn btn btn-primary mb-2 w-100"> 
        Sign up 
      </button>
      <br />
      <Link href="/Account/Signin" className="wd-signin-link">Sign in</Link>
    </div>
  );
}