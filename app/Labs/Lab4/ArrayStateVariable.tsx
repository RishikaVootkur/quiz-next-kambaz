/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ListGroupItem, ListGroup, Button } from "react-bootstrap";

export default function ArrayStateVariable() {
  const { todos } = useSelector((state: any) => state.todosReducer);
  const [array, setArray] = useState([1, 2, 3, 4, 5]);
  
  const addElement = () => {
    setArray([...array, Math.floor(Math.random() * 100)]);
  };
  
  const deleteElement = (index: number) => {
    setArray(array.filter((item, i) => i !== index));
  };
  
  return (
    <div id="wd-array-state-variables">
      <h2>Array State Variable</h2>
      
      <div className="border p-3" style={{ width: "170px" }}>
        <Button 
          variant="success"
          onClick={addElement}
          className="mb-3">
          Add Element
        </Button>
        
        {array.map((item, index) => (
          <div key={index} className="mb-2">
            {item}
            <Button 
              variant="danger"
              size="sm"
              className="ms-5"
              onClick={() => deleteElement(index)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
      <hr/>
      
      <ListGroup>
        {todos.map((todo: any) => (
          <ListGroupItem key={todo.id}>
            {todo.title}
          </ListGroupItem>
        ))}
      </ListGroup>
      <hr />
    </div>
  );
}