'use client';
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ListGroupItem, Button, FormControl } from "react-bootstrap";
import { addTodo, updateTodo, setTodo } from "./todosReducer";

type Todo = { id: string; title: string };
type RootState = { todosReducer: { todo: Todo; todos: Todo[] } };

export default function TodoForm() {
  const todo = useSelector<RootState, Todo>((state) => state.todosReducer.todo);
  const dispatch = useDispatch();

  return (
    <ListGroupItem>
      <div className="d-flex align-items-center gap-2">
        <FormControl
          className="flex-grow-1"
          placeholder="Enter a task"
          value={todo.title}
          onChange={(e) =>
            dispatch(setTodo({ ...todo, title: e.target.value }))
          }
        />
        <Button
          variant="warning"
          onClick={() => dispatch(updateTodo(todo))}
          id="wd-update-todo-click"
        >
          Update
        </Button>
        <Button
          variant="success"
          onClick={() => dispatch(addTodo(todo))}
          id="wd-add-todo-click"
        >
          Add
        </Button>
      </div>
    </ListGroupItem>
  );
}