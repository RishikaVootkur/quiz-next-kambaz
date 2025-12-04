/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { FaCheck, FaUserCircle } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import * as client from "../../../Account/client";
import { FaPencil } from "react-icons/fa6";
import { FormControl } from "react-bootstrap";

export default function PeopleDetails({
  uid,
  onClose,
}: {
  uid: string | null;
  onClose: () => void;
}) {
  const [user, setUser] = useState<any>({});
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchUser = async () => {
    if (!uid) return;
    const loadedUser = await client.findUserById(uid);
    setUser(loadedUser);
  };

  useEffect(() => {
    if (uid) {
      fetchUser();
    }
  }, [uid]);

  if (!uid) return null;

  const startEditing = () => {
    setName(`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim());
    setEditing(true);
  };

  const saveUser = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }

    const [firstName, ...rest] = trimmed.split(" ");
    const lastName = rest.join(" ");
    const updatedUser = { ...user, firstName, lastName };

    await client.updateUser(updatedUser);
    setUser(updatedUser);
    setEditing(false);
  };

  const deleteUser = async (uidToDelete: string) => {
    await client.deleteUser(uidToDelete);
    onClose();
  };

  return (
    <div className="wd-people-details position-fixed top-0 end-0 bottom-0 bg-white p-4 shadow w-25">
      <button
        onClick={onClose}
        className="btn position-fixed end-0 top-0 wd-close-details"
      >
        <IoCloseSharp className="fs-1" />
      </button>

      <div className="text-center mt-2">
        <FaUserCircle className="text-light me-2 fs-1" />
      </div>
      <hr />

      <div className="d-flex align-items-center justify-content-between mb-3">
        {!editing && (
          <div className="text-danger fs-4 wd-name">
            {user.firstName} {user.lastName}
          </div>
        )}

        {editing && (
          <FormControl
            className="w-75 wd-edit-name me-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveUser();
              }
            }}
          />
        )}

        {!editing && (
          <FaPencil
            onClick={startEditing}
            className="fs-5 mt-1 text-danger wd-edit"
          />
        )}
        {editing && (
          <FaCheck
            onClick={saveUser}
            className="fs-5 mt-1 text-danger wd-save"
          />
        )}
      </div>

      <b>Roles:</b> <span className="wd-roles">{user.role}</span> <br />
      <b>Login ID:</b> <span className="wd-login-id">{user.loginId}</span> <br />
      <b>Section:</b> <span className="wd-section">{user.section}</span> <br />
      <b>Total Activity:</b>{" "}
      <span className="wd-total-activity">{user.totalActivity}</span>

      <hr />

      <button
        onClick={() => deleteUser(uid)}
        className="btn btn-danger float-end wd-delete"
      >
        Delete
      </button>
      <button
        onClick={onClose}
        className="btn btn-light float-end me-2 wd-cancel"
      >
        Cancel
      </button>
    </div>
  );
}