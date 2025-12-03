"use client";

import React, { useState } from "react";
import { FormControl } from "react-bootstrap";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER || "";

export default function WorkingWithArrays() {
  const [todo, setTodo] = useState({
    id: "1",
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-09-09",
    completed: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API = `${HTTP_SERVER}/lab5/todos`;

  const handleRemove = async () => {
    try {
      const res = await fetch(`${API}/${todo.id}/delete`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data.message ?? `Unable to delete Todo with ID ${todo.id}`
        );
        return;
      }
      setErrorMessage(null);
    } catch {
      setErrorMessage(`Unable to delete Todo with ID ${todo.id}`);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      const res = await fetch(
        `${API}/${todo.id}/title/${encodeURIComponent(todo.title)}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data.message ?? `Unable to update Todo with ID ${todo.id}`
        );
        return;
      }
      setErrorMessage(null);
    } catch {
      setErrorMessage(`Unable to update Todo with ID ${todo.id}`);
    }
  };

  return (
    <div id="wd-working-with-arrays">
      <h3>Working with Arrays</h3>

      {errorMessage && (
        <div
          id="wd-todo-error-message"
          className="alert alert-danger mb-2 mt-2"
        >
          {errorMessage}
        </div>
      )}

      <h4>Retrieving Arrays</h4>
      <a id="wd-retrieve-todos" className="btn btn-primary" href={API}>
        Get Todos
      </a>
      <hr />

      <h4>Retrieving an Item from an Array by ID</h4>
      <a
        id="wd-retrieve-todo-by-id"
        className="btn btn-primary float-end"
        href={`${API}/${todo.id}`}
      >
        Get Todo by ID
      </a>
      <FormControl
        id="wd-todo-id"
        className="w-50"
        value={todo.id}
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <hr />

      <h3>Filtering Array Items</h3>
      <a
        id="wd-retrieve-completed-todos"
        className="btn btn-primary"
        href={`${API}?completed=true`}
      >
        Get Completed Todos
      </a>
      <hr />

      <h3>Creating new Items in an Array</h3>
      <a
        id="wd-create-todo"
        className="btn btn-primary"
        href={`${API}/create`}
      >
        Create Todo
      </a>
      <hr />

      <h3>Deleting from an Array</h3>
      <button
        id="wd-delete-todo"
        className="btn btn-primary float-end"
        onClick={handleRemove}
      >
        Delete Todo with ID = {todo.id}
      </button>
      <FormControl
        className="w-50"
        value={todo.id}
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <hr />

      <h3>Updating an Item in an Array</h3>
      <button className="btn btn-primary float-end" onClick={handleUpdateTitle}>
        Update Todo
      </button>
      <FormControl
        className="w-25 float-start me-2"
        value={todo.id}
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <FormControl
        className="w-50 float-start"
        value={todo.title}
        onChange={(e) => setTodo({ ...todo, title: e.target.value })}
      />
      <br />
      <br />
      <hr />

      <h3>Update Completed Status</h3>
      <FormControl
        className="w-25 float-start me-2"
        value={todo.id}
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) =>
          setTodo({ ...todo, completed: e.target.checked })
        }
        className="form-check-input"
      />
      <label className="form-check-label ms-2">Completed</label>
      <a
        id="wd-update-todo-completed"
        className="btn btn-primary float-end"
        href={`${API}/${todo.id}/completed/${todo.completed}`}
      >
        Complete Todo ID = {todo.id}
      </a>
      <br />
      <br />
      <hr />

      <h3>Update Description</h3>
      <FormControl
        className="w-25 float-start me-2"
        value={todo.id}
        onChange={(e) => setTodo({ ...todo, id: e.target.value })}
      />
      <FormControl
        className="w-50 float-start"
        value={todo.description}
        onChange={(e) =>
          setTodo({ ...todo, description: e.target.value })
        }
      />
      <a
        id="wd-update-todo-description"
        className="btn btn-primary float-end"
        href={`${API}/${todo.id}/description/${encodeURIComponent(
          todo.description
        )}`}
      >
        Describe Todo ID = {todo.id}
      </a>
      <br />
      <br />
      <hr />
    </div>
  );
}