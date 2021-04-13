import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import './App.css';

function App() {
  const [tree, setTree] = useState([1]);
  
  const add = () => {
    setTree([
      ...tree, `new_object_${Math.random()}`
    ])
  }

  return (
    <div className="App">     
      <div style={{width:30, height:30,}} onClick={add}>+</div> 
      {
        tree.map(uuid => <Card key={uuid} uuid={uuid} createNewCard={add}/>)
      }
    </div>
  );
}

export default App;
