import './App.css';
import { useState, useEffect } from 'react';
import {Form} from './Form';
import {DisplayContainer} from './DisplayContainer';

function App() {
  const [data, setData] = useState(0);
  const onClick = () => {
    setData(data + 1);
  }

  return (
    <div className="App">
      <h1>National team generator</h1>
      <Form />
      <DisplayContainer onClick={onClick}/>
    </div>
  );
}

export default App;
