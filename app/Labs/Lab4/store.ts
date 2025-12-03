import { configureStore } from "@reduxjs/toolkit";
import helloReducer from "./ReduxExamples/HelloRedux/helloReducer";
import counterReducer from "./ReduxExamples/CounterRedux/counterReducer";
import addReducer from "./ReduxExamples/AddRedux/addReducer";
import todosReducer from "./ReduxExamples/todos/todosReducer";
export type RootState = ReturnType<typeof store.getState>;



const store = configureStore({
  reducer: { 
    helloReducer, 
    counterReducer,
    addReducer,
    todosReducer,
   },
  });
export default store;