import ReactDOM from 'react-dom';
import {Editor, EditorState, EditorBlock, SelectionState, convertToRaw, RichUtils, ContentState, Modifier, convertFromRaw, convertFromHTML} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import React, {useState, useEffect, useRef, useCallback} from 'react';

const {hasCommandModifier} = KeyBindingUtil;

const Card = ({uuid, createNewCard, 
  updateId, 
  updateData,
  initContentState,
  findPrevCard, 
  findNextCard, 
  currentId, 
  onCheckBox, 
  initCardType, 
  initIndentCnt,
  focus,
}) => {

  //update될 때에 트리도 바꿔줘야 함..
  const editorRef = useRef();
  const editorWrapperRef = useRef();

  let defaultEditorState
  if(initContentState){
    defaultEditorState = EditorState.createWithContent(convertFromRaw(initContentState));
  }else{
    defaultEditorState = EditorState.createEmpty()
  }

  const [editorState, setEditorState] = useState(defaultEditorState);  
  const [loaded, setLoaded] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [endCnt, setEndCnt] = useState(0);
  const [toolbox, setToolbox] = useState(null)    
  const [cardType, setCardType] = useState(initCardType || 'paragraph');
  const [indentCnt, setIndentCnt] = useState(initIndentCnt || 0);
  const [myTimeout, setMyTimeout] = useState(null);


  const contentState = editorState.getCurrentContent();
  //여기서 진짜 궁금한건, contentState가 바뀌었냐지. 
  let raw = convertToRaw(contentState)

  const returnBlocks = raw.blocks.map(obj => {
    return {
      key: obj.key,
      text: obj.text,
      type: obj.type
    }
  })
  const [abstract, setAbstract] = useState(returnBlocks);

  const upHandler = () => {
    const currentContent = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    let start = selectionState.getStartOffset();

    if(start === 0){
      if(!currentContent.hasText()){
        findPrevCard(uuid, 'delete');
      }else{
        findPrevCard(uuid);
      }
    }
  }

  const downHandler = (e) => {
    const currentContent = editorState.getCurrentContent();
    const length = currentContent.getPlainText().length;
    const selectionState = editorState.getSelection();
    let start = selectionState.getStartOffset();

    if(length === start){
      setHasEnded(Math.random());
    }else{
      setHasEnded(false);
    }  
  }
  
  const onKeyUp = (evt) => {
    console.log(evt.key);

    //예도 아니었어. 
    //온 키다운은, 키업으로 해야겠음.
    const contentState = editorState.getCurrentContent();
    let raw = convertToRaw(contentState)
    console.log('onkey down');
    console.log(raw.blocks[0].text);


    if(myTimeout) {
      clearTimeout(myTimeout);
      setMyTimeout(setTimeout(() => {
        updateCurrentDraft();
      }, 500))
    }else{
      setMyTimeout(setTimeout(() => {
        updateCurrentDraft();
      }, 1000));
    }
  }

  const someFunction = () => {
    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap();
    const key = blockMap.last().getKey();
    // const length = blockMap.last().getLength();

    const selection = new SelectionState({
      anchorKey: key,
      anchorOffset: 3,
      focusKey: key,
      focusOffset: 3,
    });

    const afterSelectionMove = EditorState.acceptSelection(editorState, selection)
    const newEditorState =  EditorState.forceSelection(afterSelectionMove, afterSelectionMove.getSelection());
    setEditorState(newEditorState)
    return
  }

  useEffect(() => {
    if(hasEnded){
      setEndCnt(prev => prev + 1);
    }else{
      setEndCnt(0);
    }
  }, [hasEnded])

  useEffect(() => {
    if(currentId === uuid){
      return
    }

    if(initContentState){
      defaultEditorState = EditorState.createWithContent(convertFromRaw(initContentState));
    }else{
      defaultEditorState = EditorState.createEmpty()
    }

    setEditorState(defaultEditorState)
  }, [initContentState])

  function getSelected() {
    var t = '';
    if (window.getSelection) {
      t = window.getSelection();
    } else if (document.getSelection) {
      t = document.getSelection();
    } else if (document.selection) {
      t = document.selection.createRange().text;
    }
    return t;
  }

  useEffect(() => { 
    //그냥 여기가 fire안되는게 더 현명할 듯.
    //돌고 돌았지만..
    //문제는 [editorState]를 하면 무조건 동작은 하고,
    //처음에 이미 잘 랜러딩이 됐는데도 불구 하고 뭔가 자꾸 
    
    var selection = editorState.getSelection();    
    if (selection.isCollapsed()) {
      setToolbox(null);
    }else {
      try{
        var selected = getSelected();
        var rect = selected.getRangeAt(0).getBoundingClientRect();
        setToolbox({left: rect.left, top: rect.top - 60, width: rect.width})
      }catch(e){
        console.log('error');
        setToolbox(null);
      }
    }

    const contentState = editorState.getCurrentContent();
    //여기서 진짜 궁금한건, contentState가 바뀌었냐지. 
    let raw = convertToRaw(contentState)

    const returnBlocks = raw.blocks.map(obj => {
      return {
        key: obj.key,
        text: obj.text,
        type: obj.type
      }
    })
    
    if(compareTwoArray(abstract,returnBlocks)){
      // console.log('same so no trigger');
      return ;
    }
  }, [editorState])

  const compareTwoArray = (array1,array2) => {
    // console.log('compare');
    // console.log(array1);
    // console.log(array2);
    if(!array1){
      return false;
    }

    if(!array2){
      return false;
    }

    if(array1[0].key === array2[0].key && array1[0].text === array2[0].text) {
      return true
    }
    // return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]})
  }

  useEffect(() => {
    if(endCnt >= 1){
      const currentContent = editorState.getCurrentContent();
      const length = currentContent.getPlainText().length;
      const selectionState = editorState.getSelection();
      let start = selectionState.getStartOffset();
      if(length === start){
        findNextCard(uuid);
        return
      }
    }
  }, [endCnt])

  useEffect(() => {
    if(focus){
      focusEditor();
    }
  }, [])

  useEffect(() => {
    if(currentId === uuid){
      focusEditor();
    }
  }, [currentId])

  const onChange = (editorState) => {
    setEditorState(editorState);
    updateId(uuid);
  }

  const focusEditor = () => {
    console.log('focus editor');
    if(editorRef.current){
      editorRef.current.focus();
      // editorWrapperRef.current.focus();
    }
  }

  function myBlockStyleFn(contentBlock) {
    const type = contentBlock.getType();

    if (type === 'blockquote') {
      return 'superFancyBlockquote';
    }
  }

  const updateCurrentDraft = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    let raw = convertToRaw(contentState)
    raw.cardType = cardType
    raw.id = uuid
    raw.indentCnt = indentCnt;
    console.log(raw);
    updateData(uuid, raw);
  }, [editorState])

  const myKeyBindingFn = (e) => {
    //딱 그 글자를 하는거라서 그런가?
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {

      const contentState = editorState.getCurrentContent();
      console.log(contentState);
      let raw = convertToRaw(contentState)
      console.log('raw..');
      console.log(raw);
      raw.cardType = cardType
      raw.id = uuid
      raw.indentCnt = indentCnt;

      updateData(uuid, raw);
      return 'myeditor-save';
    }

    if (e.keyCode === 13){
      return 'split-block-new'
    }

    if (hasCommandModifier(e) && e.shiftKey && e.key === 'h') {
      return 'highlight';
    }

    if (hasCommandModifier(e) && e.shiftKey && e.key === 'g') {
      return 'test';
    }

    if (e.key === "tab"){
      return 'tab';
    }

    if (e.keyCode === 32){
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const something = editorState.getCurrentContent().getBlockMap().first().text.split("")[0];

      if(something === "-"){        
        setCardType('bullet');

        const currentSelectionState = editorState.getSelection();
        const newContentState = Modifier.replaceText(
          contentState,
          // The text to replace, which is represented as a range with a start & end offset.
          selectionState.merge( {
            // The starting position of the range to be replaced.
            anchorOffset: 0,
            // The end position of the range to be replaced.
            focusOffset: 1
          }),
          // The new string to replace the old string.
          ""
        );

        setEditorState(EditorState.push(
          editorState,
          newContentState,
          'replace-text'
        ))

        console.log(newContentState);
        return "replace-text"
      }



    }

    if (e.key === "["){
      console.log('good');
    }
    if (e.key === "]"){
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const something = editorState.getCurrentContent().getBlockMap().first().text.split("")[0];
      if(something === "["){        
        setCardType('checkbox');

        const currentSelectionState = editorState.getSelection();
        const newContentState = Modifier.replaceText(
          contentState,
          // The text to replace, which is represented as a range with a start & end offset.
          selectionState.merge( {
            // The starting position of the range to be replaced.
            anchorOffset: 0,
            // The end position of the range to be replaced.
            focusOffset: 1
          }),
          // The new string to replace the old string.
          ""
        );

        setEditorState(EditorState.push(
          editorState,
          newContentState,
          'replace-text'
        ))

        console.log(newContentState);
        return "replace-text"
      }

      console.log(something);
    }

    //ctrl+z를 누를 때에, 얼럿도 띄우고 싶다면, 여기서 다시 함수를 작성해야 함.
    return getDefaultKeyBinding(e);
  }
  
  const handleKeyCommand = (command, editorState) => {
    console.log(command);
    if(command === "test"){
      someFunction();
    }
    
    if (command === 'myeditor-save'){
      alert('saved! - I need to define custom method');
      return;
    }

    if(command === "split-block-new"){
      // alert(cardType);
      // return 
      createNewCard(cardType, indentCnt); //same thing or not!
    }
    
    if (command === "split-block"){
      return ;
    }

    if (command === "highlight"){
      onChange(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'));
    }

    if (command === "backspace"){
      const currentContent = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      let start = selectionState.getStartOffset();

      if(start === 0){
        if(cardType !== "paragraph"){
          setCardType('paragraph')
          return 
        }

        if(!currentContent.hasText()){
          findPrevCard(uuid, 'delete');
        }else{
          findPrevCard(uuid);
        }
      }
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      console.log('new state');
      onChange(newState);
      return 'handled';
    }
    console.log('not handled');

    return 'not-handled';
  }
  
  const _onBoldClick = (evt) => {
    evt.preventDefault();
    onChange(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  }

  const _onBlockQuote = () => {
    onChange(RichUtils.toggleBlockType(editorState, 'blockquote'));
  }

  const _onAtomic = () => {
    onChange(RichUtils.toggleBlockType(editorState, 'atomic'));
  }
  
  const _onMoveToEnd = (evt) => {
    evt.preventDefault();
    setEditorState(editorState => EditorState.moveFocusToEnd(editorState));
  }

  const _highlight = (evt) => {
    evt.preventDefault();
    onChange(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'));
  }

  const _onClose = (evt) => {
    setEditorState(EditorState.forceSelection(editorState, SelectionState.createEmpty('')))
  }

  const _onColor = (evt) =>{
    evt.preventDefault();
    onChange(RichUtils.toggleInlineStyle(editorState, 'RED'));    
  }

  const makeParagraph = (evt) => {
    setCardType('paragraph');
  }

  const makeCheckBox = (evt) => {
    setCardType("checkbox");
  }

  const onClickCheckBox = (evt) => {
    onCheckBox(uuid, 'checkbox', true);
  }

  const handleTab = (evt) => {
    evt.preventDefault();
  
    if (evt.shiftKey) {
      setIndentCnt(cnt => cnt - 1);
    }else{
      setIndentCnt(cnt => cnt + 1);
    }
  }
  
  const styleMap = {
    'HIGHLIGHT': {
      'backgroundColor': '#faed27',
    },
    'RED': {
      color:'red',
    }
  };

  return (
    <div className="flex fdr" ref={editorWrapperRef}>     
      <div style={{width: indentCnt * 30,}}>
      </div>
      <div className="flex fdr f1" style={{padding:8, position:'relative',}} 
      onKeyUp={onKeyUp}
      onClick={focusEditor}>
        {
          cardType === "checkbox" &&

          <label className="container">
            <input type="checkbox"/>
            <span className="checkmark"></span>
          </label>
        }
        {
          cardType === "bullet" && 
          <div>
            <div style={{fontSize:20, lineHeight: 1, width:20, height:15, marginTop:3,}}>•</div>
          </div>
        }

        {
          toolbox &&
          <div style={{position:'fixed', left:toolbox.left, top:toolbox.top, width:200, height:50, zIndex:10,}} className="flex fdr p-4p">
            <button onMouseDown={_onBoldClick}>Bold</button>
            <button onMouseDown={_onColor}>Red</button>
            <button onClick={_onAtomic}>Atomic</button>
            <button onMouseDown={_onClose}>Exit</button>
            <button onMouseDown={_highlight}>highlight</button>    
          </div>
        }
        
        <Editor
          customStyleMap={styleMap}
          placeholder="Tell a story..."
          ref={editorRef}
          handleKeyCommand={handleKeyCommand}
          blockStyleFn={myBlockStyleFn} 
          editorState={editorState}
          onDownArrow={keyEvent => {
            downHandler(keyEvent)
          }}
          onUpArrow={keyEvent => {
            upHandler()
          }}
          onTab={handleTab}
          onChange={onChange}
          keyBindingFn={myKeyBindingFn}
        />
      </div>
    </div>
  );
}

export default Card;
