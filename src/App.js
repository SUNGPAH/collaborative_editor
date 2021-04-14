import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import './App.css';

function App() {
  const [tree, setTree] = useState([{
    id: `new_object_${Math.random()}`,
    content: null, // -> just render this!
  },]);
  const [currentId, setCurrentId] = useState(null);
  const sampleMarkup = 'I am making a collaborative editor'
  
/* 
- [done] 현재 상태에서 딜리트를 누르면, 위로 올라가서, 위에거 하나씩 지우게 되어야 함.
  --> 지금 있는 위치에서 있는게 있는지 없는지를 알 방법?
- [done] 키보드 아래로 내려가게. (하나의 카드에서 끝나면, 다음 카드로 가게끔)
- [done]위에서 엔터를 치면, 맨아래로 추가가 되는데, 현재것이 추가가 바로 아래에 되어야 함. -> 어떻게 구현할지 생각해보기. 
- 텍스트의 왼쪽 끝에 왔을 때에!
  - 왼쪽에 암것도 없는 걸 어떻게 알지? location?
- [done[ 내려갈때! 다음 카드로 넘어가게 하자.
- [done] 마우스의 현재 커서 위치 어떻게 알지? var start = selectionState.getStartOffset();
- 여러명이 들어왔다면, 지우는 건 사이좋게 지워야 한다. ㅋㅋ
- [done] 별로 내용이 없을 때 지우게 하자.

- 특정 위치로 마우스 커서 가져가기.

- [done] 색깔 바꾸기 - 단축키 하나 추가하기
  - command + shift + h
- [done] notion처럼! 셀렉션이 되면, 바로 반응하도록.
- [ ] 다른 거 누르면, 툴바 꺼지게!
- 전체 선택 해서 지우는거 되도록.
- 위젯. 
  - 엑티브 상태면 띄우기
- 지우는걸 어떻게 해야 하나? 누가 어떻게 저장하고 있는게 현명한것일까?
- checkbox 
*/

  const add = () => {
    const index = tree.findIndex(obj => obj.id === currentId)

    if(index === -1){
      setTree([
        ...tree, {
          id: `new_object_${Math.random()}`           
        }
      ])  
    }else{
      const copiedTree = [...tree]
      copiedTree.splice(index + 1, 0, {
        id: `new_object_${Math.random()}`           
      }); 
      setTree(copiedTree);
    }
  }

  const updateId = (id) => {
    setCurrentId(id);
  }

  const findPrevCard = (uuid, actionType) => {
    const index = tree.findIndex(obj => obj.id === uuid)
    if(index === -1){
      return
    }

    if(index === 0){
      return
    }

    setCurrentId(tree[index - 1].id);

    if(actionType === "delete"){
      const copied = [...tree];
      copied.splice(index,1);
      setTree(copied);
    }
  }

  const findNextCard = (uuid) => {
    const index = tree.findIndex(obj => obj.id === uuid)
    if(index === -1){
      return
    }
    if(!tree[index+1]){
      return
    }
    setCurrentId(tree[index + 1].id);
  }
  // <div style={{width:30, height:30,}} onClick={add}>+</div> 

  return (
    <div className="App" style={{padding:24,}}>     
      {
        tree.map((obj) => <Card key={obj.id} 
        uuid={obj.id} 
        currentId={currentId}
        sampleMarkup={sampleMarkup}
        createNewCard={add} 
        findPrevCard={findPrevCard}
        findNextCard={findNextCard}
        updateId={updateId}/>)
      }
    </div>
  );
}

export default App;
