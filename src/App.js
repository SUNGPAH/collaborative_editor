import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import './App.css';
import {db, firebaseApp, firebase} from './firebase';

function App() {
  const [tree, setTree] = useState([]);
  const [delta, setDelta] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const sampleMarkup = ''
  
  useEffect(() => {
    const blocksRef = db.collection('document').doc('someDocumentId').collection('blocks')
    blocksRef.onSnapshot((snapshot) => {
      const changes = snapshot.docChanges().map(change => change.doc.data());
      const _tree = changes.find(change => change.tree);
      const _changes = changes.filter(change => !change.tree)

      setDelta({
        tree: _tree ? _tree.tree : null,
        changes: _changes
      })
    })
  }, [])

  useEffect(() => {
    console.log('--delta---');
    console.log(delta);
    if(!delta){
      return
    }

    const treeCandidate = delta.tree ? delta.tree : tree

    //tree가 업데이트가 되는 경우에는, 새로운 섹션이 나타나게 됨. 내가 동작을 하고 있는게 아니라면!

    const _list = treeCandidate.map((treeShallowObj) => {        
      const obj = delta.changes.filter(obj => obj.id === treeShallowObj.id)[0];

      if(obj){
        treeShallowObj.initContentState = obj.content
      }
      return treeShallowObj
    })
      
    setTree(_list);
  }, [delta])  

  const add = (cardType, indentCnt) => {
    const index = tree.findIndex(obj => obj.id === currentId)

    let newTree
    if(index === -1){
      
      newTree = [
        ...tree, {
          id: `new_object_${Math.random()}`,
          initCardType: cardType,
          initIndentCnt: indentCnt,
          focus: true,
        }
      ]

      setTree(newTree)  
    }else{      
      const copiedTree = [...tree]
      copiedTree.splice(index + 1, 0, {
        id: `new_object_${Math.random()}`,           
        initCardType: cardType,
        initIndentCnt: indentCnt,
        focus: true,
      }); 
      newTree = copiedTree;
      setTree(newTree);
    }
    //is copy not completely working in the way I expected?
    
    const _tree = newTree.map(treeObj => {
      const copiedTreeObj = {...treeObj}
      if(!copiedTreeObj.content){
        delete copiedTreeObj.content;
      }
      if(copiedTreeObj.focus){
        delete copiedTreeObj.focus
      }
      return copiedTreeObj
    })

    // return 

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc('tree')
    .set({tree:_tree})
    .then((ref) => {
      console.log('tree saved');
    })
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
        focus={obj.focus}
        />)
      }
    </div>
  );
}

export default App;
