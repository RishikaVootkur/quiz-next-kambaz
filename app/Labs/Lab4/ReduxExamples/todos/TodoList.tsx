'use client';
import React from "react";
import { useSelector } from "react-redux";
import { ListGroup } from "react-bootstrap";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

type Todo = { id: string; title: string };
type RootState = { todosReducer: { todo: Todo; todos: Todo[] } };

export default function TodoList() {
  const todos = useSelector<RootState, Todo[]>(
    (state) => state.todosReducer.todos
  );

  return (
    <div id="wd-todo-list-redux">
      <h2 className="mb-3">Todo List</h2>
      <ListGroup className="mb-3">
        <TodoForm />
        {todos.map((t) => (
          <TodoItem key={t.id} todo={t} />
        ))}
      </ListGroup>
      <hr />
    </div>
  );
}