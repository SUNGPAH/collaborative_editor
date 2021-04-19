import {Editor, EditorState, SelectionState, convertToRaw, RichUtils, Modifier, convertFromRaw} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import React, {useState, useEffect, useRef} from 'react';

const {hasCommandModifier} = KeyBindingUtil;

const Card = ({uuid, createNewCard, 
  updateId, 
  updateData,
  initContentState,
  findPrevCard, 
  findNextCard, 
  currentId, 
  initCardType, 
  initIndentCnt,
  focus,
}) => {

  const editorRef = useRef();
  const editorWrapperRef = useRef();

  let defaultEditorState
  if(initContentState){
    defaultEditorState = EditorState.createWithContent(convertFromRaw(initContentState));
  }else{
    defaultEditorState = EditorState.createEmpty()
  }

  const [editorState, setEditorState] = useState(defaultEditorState);  
  const [dataForDelta, setDataForDelta] = useState(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [endCnt, setEndCnt] = useState(0);
  const [toolbox, setToolbox] = useState(null)    
  const [cardType, setCardType] = useState(initCardType || 'paragraph');
  const [indentCnt, setIndentCnt] = useState(initIndentCnt || 0);
  const [myTimeout, setMyTimeout] = useState(null);

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
      console.log('ended yet');
      setHasEnded(Math.random());
    }else{
      console.log('not ended yet');
      setHasEnded(false);
    }  
  }
  
  const onKeyUp = (evt) => {   
    if(evt.key === "ArrowUp"){
      return;
    }

    if(evt.key === "ArrowDown"){
      return
    }

    if(evt.key === 'ArrowLeft' || evt.key === "ArrowRight"){
      return
    }

    if(evt.key === "Shift" || evt.key === "Escape" || evt.key === "Command" || evt.key === "Meta"){
      return
    }
    
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

  const onKeyDown = (evt) => {
    if(evt.key === "ArrowUp"){
      upHandler()
      return;
    }

    if(evt.key === "ArrowDown"){
      downHandler(evt)
      return
    }

    if(evt.key === "Tab"){
      handleTab(evt);
    }
  }

  useEffect(() => {
    if(hasEnded){
      setEndCnt(prev => prev + 1);
    }else{
      setEndCnt(0);
    }
  }, [hasEnded])

  useEffect(() => {
    setLoaded(true);
  }, [])

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

  useEffect(() => {
    if(!loaded){
      return false;
    }

    console.log('init card type');
    setCardType(initCardType);

  }, [initCardType])

  useEffect(() => {
    if(!loaded){
      return false;
    }

    console.log('initIndentCnt');
    setIndentCnt(initIndentCnt);
  }, [initIndentCnt])

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

    const data = convertToRaw(editorState.getCurrentContent()).blocks[0]
    const delta = {
      text: data.text,
      inlineStyleRanges: data.inlineStyleRanges,
    }

    if(compareDelta(delta, dataForDelta)){
      return
    }

    setDataForDelta(delta);

  }, [editorState])

  useEffect(() => {
    console.log('current content');
    console.log(dataForDelta);
  }, [dataForDelta])

  const compareArray = (arr1, arr2) => {
    let same = true;
    arr1.forEach((obj, index) => {
     Object.keys(arr1[index]).forEach(key => {
        if(!arr2[index]){
          return false
        }

        if(obj[key] === arr2[index][key]){
          console.log('same!');
        }else{
          same = false
        }
      })
    })

    return same
  }

  const compareDelta = (delta1, delta2) => {
    if(!delta1){
      return
    }

    if(!delta2){
      return
    }

    if(delta1.text !== delta2.text){
      return false
    }

    return compareArray(delta1.inlineStyleRanges, delta2.inlineStyleRanges)
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
    // console.log('focus editor');
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

  const updateCurrentDraft = () => {
    const contentState = editorState.getCurrentContent();
    let raw = convertToRaw(contentState)
    raw.cardType = cardType
    raw.id = uuid
    raw.indentCnt = indentCnt;
    updateData(uuid, raw);
  };

  const myKeyBindingFn = (e) => {
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
    }

    if (e.key === "]"){
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const something = editorState.getCurrentContent().getBlockMap().first().text.split("")[0];
      if(something === "["){        
        setCardType('checkbox');

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
      onKeyDown={onKeyDown}
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
          onChange={onChange}
          keyBindingFn={myKeyBindingFn}
        />
      </div>
    </div>
  );
}

export default Card;
