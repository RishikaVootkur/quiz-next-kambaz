"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from "../client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FormControl, Button, Alert } from "react-bootstrap";

export default function Signin() {
  const [credentials, setCredentials] = useState<any>({});
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  
  const signin = async () => { 
    try {
      setError(""); 
      const user = await client.signin(credentials);
      if (!user) {
        setError("Invalid username or password");
        return;
      }
      dispatch(setCurrentUser(user));
      router.push("/Dashboard");
    } catch (err: any) {
      console.error("Signin error:", err);
      setError("Invalid username or password");
    }
  };
  
  return (
    <div id="wd-signin-screen" style={{ maxWidth: "400px" }}>
      <h1>Sign in</h1>
      
      {error && (
        <Alert variant="danger" className="mb-3" style={{ maxWidth: "300px" }}>
          {error}
        </Alert>
      )}
      
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={credentials.username || ""}
        onChange={(e) => {
          setCredentials({ ...credentials, username: e.target.value });
          setError(""); 
        }}
        className="mb-2" 
        placeholder="username" 
        id="wd-username" 
      />
      
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={credentials.password || ""}
        onChange={(e) => {
          setCredentials({ ...credentials, password: e.target.value });
          setError(""); 
        }}
        className="mb-2" 
        placeholder="password" 
        type="password" 
        id="wd-password" 
      />
      
      <Button 
        style={{ maxWidth: "300px" }}
        onClick={signin} 
        id="wd-signin-btn" 
        className="w-100"
      > 
        Sign in 
      </Button>
      
      <br/>
      <Link id="wd-signup-link" href="/Account/Signup"> Sign up </Link>
    </div>
  );
}