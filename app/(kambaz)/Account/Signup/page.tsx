/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormControl, Button, Form, Alert } from "react-bootstrap";
import * as client from "../client";

export default function Signup() {
  const [user, setUser] = useState<any>({ role: "STUDENT" });
  const [retypePassword, setRetypePassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  
  const signup = async () => {
    if (user.password !== retypePassword) {
      setError("Passwords do not match");
      return;
    }

    if (!user.username || !user.password) {
      setError("Username and password are required");
      return;
    }

    try {
      setError("");
      const currentUser = await client.signup(user);
      dispatch(setCurrentUser(currentUser));
      router.push("/Account/Profile");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error?.response?.data?.message || "Signup failed");
    }
  };
  
  return (
    <div className="wd-signup-screen">
      <h1>Sign up</h1>
      
      {error && (
        <Alert variant="danger" className="mb-3" style={{ maxWidth: "300px" }}>
          {error}
        </Alert>
      )}
      
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={user.username || ""} 
        onChange={(e) => {
          setUser({ ...user, username: e.target.value });
          setError("");
        }}
        className="wd-username mb-2" 
        placeholder="username" 
      />
      
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={user.password || ""} 
        onChange={(e) => {
          setUser({ ...user, password: e.target.value });
          setError("");
        }}
        className="wd-password mb-2" 
        placeholder="password" 
        type="password"
      />
      
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={retypePassword} 
        onChange={(e) => {
          setRetypePassword(e.target.value);
          setError("");
        }}
        className="wd-retype-password mb-2" 
        placeholder="re-type password" 
        type="password"
      />
      
      <Form.Select 
        style={{ maxWidth: "300px" }}
        value={user.role || "STUDENT"} 
        onChange={(e) => setUser({ ...user, role: e.target.value })}
        className="wd-role mb-2"
      >
        <option value="STUDENT">Student</option>
        <option value="FACULTY">Faculty</option>
        <option value="TA">TA</option>
        <option value="ADMIN">Admin</option>
      </Form.Select>
      
      <Button 
        style={{ maxWidth: "300px" }}
        onClick={signup} 
        className="wd-signup-btn mb-2 w-100"
        variant="primary"
      > 
        Sign up 
      </Button>
      
      <br />
      <Link href="/Account/Signin" className="wd-signin-link">Sign in</Link>
    </div>
  );
}