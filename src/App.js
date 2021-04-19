import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import './App.css';
import {db, firebase} from './firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useParams} from "react-router-dom";

function App() {
  const [tree, setTree] = useState([]);
  const [delta, setDelta] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { userId } = useParams();

  useEffect(() => {
    const blocksRef = db.collection('document').doc('someDocumentId').collection('blocks')
    blocksRef.onSnapshot((snapshot) => {
      const changes = snapshot.docChanges().map(change => change.doc.data());
      const _tree = changes.find(change => change.tree);
      const _changes = changes.filter(change => !change.tree)

      setDelta({
        tree: _tree ? _tree.tree : null,
        changes: _changes,
        updater: _tree ? _tree.updater : (_changes[0] ? _changes[0].updater : null) ,
      })
    })
  }, [])

  useEffect(() => {
    if(!delta){
      return
    }
    
    if(loaded && delta.updater === userId){
      toast.success("pass this update because this user updates");
      return
    }
    console.log('-------------------------');
    console.log(delta);

    const treeCandidate = delta.tree ? delta.tree : tree    
    const _list = treeCandidate.map((treeShallowObj) => {        
      const obj = delta.changes.filter(obj => obj.id === treeShallowObj.id)[0];

      if(obj){        
        if(!loaded){
          treeShallowObj.initContentState = obj.content
          treeShallowObj.initIndentCnt = obj.content.indentCnt
          treeShallowObj.initCardType = obj.content.cardType    
        }else{
          if(obj.updater===userId){
            console.log('updater id is userId');
            //so pass the update!
          } else{
            treeShallowObj.initContentState = obj.content
            treeShallowObj.initIndentCnt = obj.content.indentCnt
            treeShallowObj.initCardType = obj.content.cardType  
          }         
        }
      }else{
        //여긴 이미 있는 기존에 렌더링 되었던 tree에서 찾아서 가져오는 것 (그대로 복사)  
        const sth = tree.filter(obj => obj.id === treeShallowObj.id)[0];
        if(sth){
          console.log(sth);
          treeShallowObj.initContentState = sth.initContentState
          treeShallowObj.initIndentCnt = sth.initIndentCnt
          treeShallowObj.initCardType = sth.initCardType
          // console.log('existing..'); 
        }else{
          // console.log('no obj');
        }
      }

      return treeShallowObj
    })
    
    toast(`new delta ${delta.updater}`);
    setTree(_list);

    if(!loaded){
      setLoaded(true);
    }
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

      if(copiedTreeObj.initContentState){
        delete copiedTreeObj.initContentState
      }

      return copiedTreeObj
    })

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc('tree')
    .set({tree:_tree, updater: userId})
    .then((ref) => {
      console.log('tree saved');
    })
  }

  const updateId = (id) => {
    setCurrentId(id);
  }

  const updateData = (id, raw) => {
    // toast.info(raw.content);

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc(id).set({
      id: id,
      content: raw,
      created: firebase.firestore.Timestamp.now().seconds,
      updater: userId
    })
    .then((ref) => {
      console.log(raw);
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

      db
      .collection('document')
      .doc('someDocumentId')
      .collection('blocks')
      .doc('tree')
      .set({tree:copied})
      .then((ref) => {
        console.log('tree saved');
      })

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
      <ToastContainer />
    </div>
  );
}

export default App;
