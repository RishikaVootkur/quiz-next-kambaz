"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as client from "../client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCurrentUser } from "../reducer";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FormControl, Button } from "react-bootstrap";

export default function Signin() {
  const [credentials, setCredentials] = useState<any>({});
  const dispatch = useDispatch();
  const router = useRouter();
  
  const signin = async () => { 
    const user = await client.signin(credentials);
    if (!user) return;
    dispatch(setCurrentUser(user));
    router.push("/Dashboard");
  };
  
  return (
    <div id="wd-signin-screen" style={{ maxWidth: "400px" }}>
      <h1>Sign in</h1>
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={credentials.username || ""}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        className="mb-2" 
        placeholder="username" 
        id="wd-username" 
      />
      <FormControl 
        style={{ maxWidth: "300px" }}
        value={credentials.password || ""}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
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
      </Button> <br/>
      <Link id="wd-signup-link" href="/Account/Signup"> Sign up </Link>
    </div>
  );
}