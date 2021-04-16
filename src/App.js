import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import './App.css';

import {db, firebaseApp, firebase} from './firebase';

function App() {
  //이건 이렇게 하면 안되긴 함.
  const [tree, setTree] = useState([]);

  const [currentId, setCurrentId] = useState(null);
  const sampleMarkup = ''
  
/* 
- [done] how to apply blockquote
- [done] when changing the state, highlight stay? -> onMouseDown + preventDefault();
- [done] bold를 누르고 나면, 그다음 부터 쳐지는 것은 바뀌어야 할텐데! 어떻게 하지?
- [half] custom block rendering.
- [done] when enter -> new thing. -> use props.
- [done] 현재 상태에서 딜리트를 누르면, 위로 올라가서, 위에거 하나씩 지우게 되어야 함.
- [done] 키보드 아래로 내려가게. (하나의 카드에서 끝나면, 다음 카드로 가게끔)
- [done]위에서 엔터를 치면, 맨아래로 추가가 되는데, 현재것이 추가가 바로 아래에 되어야 함. -> 어떻게 구현할지 생각해보기. 
- [done] 텍스트의 왼쪽 끝에 왔을 때에!
- [done[ 내려갈때! 다음 카드로 넘어가게 하자.
- [done] 마우스의 현재 커서 위치 어떻게 알지? var start = selectionState.getStartOffset();
- [done] 별로 내용이 없을 때 지우게 하자.
- [done] 특정 위치로 마우스 커서 가져가기.
  - someFunction
- [done] 색깔 바꾸기 - 단축키 하나 추가하기
  - command + shift + h
- [done] notion처럼! 셀렉션이 되면, 바로 반응하도록.
- [done]rect 관련해서, 항상 절대적인 값 잘하기 
  fixed로 해결
  - [ ] 다른 거 누르면, 툴바 꺼지게!
- [ ] 전체 선택 해서 지우는거 되도록. -> 이건 모두를 위해서 안해야 하는거 아닌가? 일단 금지 ㅋㅋ -ㅅ-; 
  - ctrl + all -> 셀렉터블 하게끔....
  - 이건 좀 나중에.
- 위젯. 
  - 엑티브 상태면 띄우기
- 지우는걸 어떻게 해야 하나? 누가 어떻게 저장하고 있는게 현명한것일까?

checkbox
- [done] checkbox - 슬슬 한 번 해보자. 내일!
  - 이걸 해봅시다용.
  - 카드를 누를 때에, 데이터를 업데이트를 해줘야 한다.
- [done] --> [] 를 처음에 한다면..
  - 어떻게 해야 할까?
  - 맨 왼쪽에 있어야 한다.
  - 맨왼쪽에 있는 두 글자가..
  - 일단 [ 를 누르는 순간에 인식하고 있으면 되고, ]일때 리스너에 로직이 있으면 된다.
- [done] 처음 두글자를 읽어오세용.
- [done] 처음 몇글자를 삭제해보세요.
- [done] 체크박스에서 엔터를 마지막 라인에서 누르면, 아래에도 체크 박스 스타일이 유지가 되도록..!
- [done] indent 에 대해서 작업하자
  인덴트는 사실 그냥 데이터의 일부임.
  디폴트는 0 
  그냥 탭 누를 때마다 이면 될 듯. 
  쉬프트 탭을 누르면 통과.  
- [done] bullet
- [done] 만약에 비어 있는 상태에서, 딜리트를 누른다면, cardType을 다시 디폴트로..

- 오늘 이게 핵심..!
- [ ] connect to db. 
  - !!!.. dataset how to ?


- [ ] 화살표를 위로 할때 좀 이상하다. 

- [ ] 타이핑 칠 때, 스크롤이 아래로 자동으로 좀 되어야 하겠다링.
- [ ] 커서 현재 위치를 어떻게 전달할지를 고민해야 할 듯.
  - 어떻게 상대방의 커서를 알려줄지!
- 여러명이 들어왔다면, 지우는 건 사이좋게 지워야 한다. ㅋㅋ
- 지우는 것과 작성하는 것에 대해서, 잘 생각해보도록 하자. ctrl + z가 지원되는 것..
- optimzation


- [ ] how to save
  convertToRaw
  const contentState = editorState.getCurrentContent();
  const raw = convertToRaw(contentState)

- [ ] how to start?

- [ ] how to ..send data..(difference)
  - snapshot! ..

- 이제 부터는.. 업데이트를 3초에 한 번? 

-----

*/
  useEffect(() => {
    if(tree.length === 0){
      return 
    }
    console.log('whats tree');
    console.log(tree);
    
    const _tree = tree.map(treeObj => {
      if(!treeObj.content){
        delete treeObj.content;
        // treeObj.delete('content');
      }
      return treeObj
    })

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc('tree')
    .set({tree:_tree})
    .then((ref) => {
      console.log('tree saved');
    })
  }, [tree])

  useEffect(() => {
    const blocksRef = db.collection('document').doc('someDocumentId').collection('blocks')
    blocksRef.get().then((snapshot) => {

      const data = snapshot.docs.filter(x => x.id !== 'tree').map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('blocks ref');
      console.log(data);
      
      const treeObj = snapshot.docs.find(x => x.id === "tree")

      if(!treeObj){
        return
      }
      
      const treeArchitecture = treeObj.data().tree;
      
      const list = treeArchitecture.map((treeShallowObj) => {
        
        const obj = data.filter(obj => obj.id === treeShallowObj.id)[0];
        // treeShallowObj.id
        if(obj){
          console.log('obj exist');
          console.log(obj.content);
          treeShallowObj.initContentState = obj.content
        }else{
          
        }
        // console.log('content');
        // console.log(content);
        
        return treeShallowObj
      })

      console.log('---list');
      console.log(list);    

      setTree(list);
      // setChats(data);
    })

    // init..을 그렇게 해야 하나.. 
    // 이게 디퍼런스가 엄청날텐데 말이지..

    // 콜렉션으로 두번 불러와야함.
    // setTree([{
    //   id: `new_object_${Math.random()}`,
    //   content: null, // -> just render this
    // },])

  }, [])

  const add = (cardType, indentCnt) => {
    const index = tree.findIndex(obj => obj.id === currentId)
    console.log('add');
    console.log(index);
    if(index === -1){
      setTree([
        ...tree, {
          id: `new_object_${Math.random()}`,
          initCardType: cardType,
          initIndentCnt: indentCnt,
        }
      ])  
    }else{
      console.log(cardType);
      
      const copiedTree = [...tree]
      copiedTree.splice(index + 1, 0, {
        id: `new_object_${Math.random()}`,           
        initCardType: cardType,
        initIndentCnt: indentCnt,
      }); 
      setTree(copiedTree);
    }
  }

  const updateId = (id) => {
    setCurrentId(id);
  }

  const updateData = (id, raw) => {
    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc(id).set({
      id: id,
      content: raw,
      created: firebase.firestore.Timestamp.now().seconds
    })
    .then((ref) => {
    })
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

  const onCheckBox = (uuid, cardType, state) => {
    alert(`${cardType}--${uuid}`);
  }

  return (
    <div className="App" style={{padding:24,}}>     
      <div onClick={evt => add('paragraph', 0)}>+++</div>

      {
        tree.map((obj) => <Card key={obj.id} 
        onCheckBox={onCheckBox}
        initCardType={obj.initCardType}
        initIndentCnt={obj.initIndentCnt}
        initContentState={obj.initContentState}
        uuid={obj.id} 
        currentId={currentId}
        createNewCard={add} 
        findPrevCard={findPrevCard}
        findNextCard={findNextCard}
        updateId={updateId}
        updateData={updateData}
        />)
      }
    </div>
  );
}

export default App;
