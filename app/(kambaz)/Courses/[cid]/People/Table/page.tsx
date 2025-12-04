"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import PeopleDetails from "../Details";
import Link from "next/link";


export default function PeopleTable({ users = [], fetchUsers }: { users?: any[]; fetchUsers: () => void; }) {

  const [showDetails, setShowDetails] = useState(false);
  const [showUserId, setShowUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div id="wd-people-table">
      {showDetails && (
       <PeopleDetails
         uid={showUserId}
         onClose={() => {
           setShowDetails(false);
           fetchUsers();
         }}/>
     )}

      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Login ID</th>
            <th>Section</th>
            <th>Role</th>
            <th>Last Activity</th>
            <th>Total Activity</th>
          </tr>
        </thead>
        <tbody>
          {users
            .map((user) => (
              <tr key={user._id}>
                <td className="wd-full-name text-nowrap">
                  <span className="text-decoration-none"
                 onClick={() => {
                   setShowDetails(true);
                   setShowUserId(user._id);
                 }} >
                  <FaUserCircle className="me-2 fs-1 text-light" />
                  <span className="wd-first-name">{user.firstName}</span>{" "}
                  <span className="wd-last-name">{user.lastName}</span>
                  </span>
                </td>
                <td className="wd-login-id">{user.loginId}</td>
                <td className="wd-section">{user.section}</td>
                <td className="wd-role">{user.role}</td>
                <td className="wd-last-activity">{user.lastActivity}</td>
                <td className="wd-total-activity">{user.totalActivity}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );
}