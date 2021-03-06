import React, {useEffect, useState} from 'react';
import CardMemo from './components/Card';
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
  const [locationDelta, setLocationDelta] = useState(null);
  const [locations, setLocations] = useState([]);
  const [myTimeout, setMyTimeout] = useState(null);
  const [updateTreeSignal, setUpdateTreeSignal] = useState(null);

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

    const locationRef = db.collection('document').doc('someDocumentId').collection('locations')
    locationRef.onSnapshot((snapshot) => {
      console.log('location ref');
      const changes = snapshot.docChanges().map(change => change.doc.data());
      setLocationDelta(changes[0]);
    })
  }, [])

  useEffect(() => {
    if(!locationDelta){
      return
    }
    
    const index = locations.findIndex(location => location.userId === locationDelta.userId)
    const copied = [...locations]

    if(index === -1){
      copied.push(locationDelta)  
    }else{
      copied[index]= locationDelta
    }

    setLocations(copied);

  }, [locationDelta])

  useEffect(() => {
    if(!delta){
      return
    }
    
    if(loaded && delta.updater === userId){
      // toast.success("pass this update because this user updates");
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
        //?????? ?????? ?????? ????????? ????????? ????????? tree?????? ????????? ???????????? ??? (????????? ??????)  
        const sth = tree.filter(obj => obj.id === treeShallowObj.id)[0];
        if(sth){
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
    
    // toast(`new delta ${delta.updater}`);
    setTree(_list);

    if(!loaded){
      setLoaded(true);
    }
  }, [delta])  

  useEffect(() => {
    if(!loaded){
      return
    }

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('locations')
    .doc(userId).set({
      userId: userId,
      currentId: currentId,
      created: firebase.firestore.Timestamp.now().seconds,
    })
    .then((ref) => {
      console.log('cursor');
    })

  }, [currentId])

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

    //????????? tree????????? ???????????? ?????????, ????????? ?????????, ????????? ????????? ????????? ????????? ???????????? ???????????? ?????????,
    //????????? ?????? ??????.
    //?????????, ??????????????? treeSignal??? ???????????? ??????
    setUpdateTreeSignal(`${Math.random()}`);
  }

  const updateId = (id) => {
    setCurrentId(id);
  }

  useEffect(() => {
    if(!loaded){
      return false
    }

    if(!updateTreeSignal){
      return
    }
    
    if(myTimeout) {
      clearTimeout(myTimeout);
      setMyTimeout(setTimeout(() => {
        updateTree();
      }, 500))
    }else{
      setMyTimeout(setTimeout(() => {
        updateTree();
      }, 1000));
    }

  }, [updateTreeSignal])

  const updateTree = () => {
    const _tree = tree.map(treeObj => {
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

    console.log('update tree');
    console.log(_tree);

    db
    .collection('document')
    .doc('someDocumentId')
    .collection('blocks')
    .doc('tree')
    .set({tree:_tree, updater: userId, whatIsIt: 'updateTree'})
    .then((ref) => {
      console.log('tree saved');
    })

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
      updater: userId,
      whatIsIt: 'update Data--',
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
      setUpdateTreeSignal(`${Math.random()}`)
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
    <div className="App flex jcc" style={{padding:24, backgroundColor:'#dcdcdc', }}>     
      <div style={{position:'fixed', height:100, zIndex:2, backgroundColor:'white', width:'100%', top:0,left:0, }}>
      </div>

      <div style={{marginTop:100,}}>
        
        <div onClick={evt => add('paragraph', 0)}>+++</div>

        <div style={{padding:16,  width:1100, backgroundColor:'white', maxWidth:1100, borderRadius:8, display:'inline-block'}}>
        {
          tree.map((obj) => <CardMemo key={obj.id} 
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
          locations={locations}
          />)
        }

        </div>

      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
