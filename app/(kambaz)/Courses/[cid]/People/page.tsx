"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PeopleTable from "./Table/page";
import * as client from "../../client";

export default function People() {
  const { cid } = useParams();
  
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    if (!cid) return;
    
    try {
      const enrolledUsers = await client.findUsersForCourse(cid as string);
      setUsers(enrolledUsers);
    } catch (error) {
      console.error("Error fetching users for course:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [cid]);

  return (
    <div id="wd-people">
      <PeopleTable users={users} fetchUsers={fetchUsers} />
    </div>
  );
}