'use client';
import React from "react";
import { useDispatch } from "react-redux";
import { ListGroupItem, Button } from "react-bootstrap";
import { deleteTodo, setTodo } from "./todosReducer";

type Todo = { id: string; title: string };

export default function TodoItem({ todo }: { todo: Todo }) {
  const dispatch = useDispatch();

  return (
    <ListGroupItem className="d-flex align-items-center justify-content-between">
      <span>{todo.title}</span>
      <div className="d-flex gap-2">
        <Button
          variant="primary"
          onClick={() => dispatch(setTodo(todo))}
          id="wd-set-todo-click"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => dispatch(deleteTodo(todo.id))}
          id="wd-delete-todo-click"
        >
          Delete
        </Button>
      </div>
    </ListGroupItem>
  );
}