import ReactDOM from 'react-dom';
import {Editor, EditorState, EditorBlock, SelectionState, convertToRaw, RichUtils, ContentState, Modifier, convertFromRaw, convertFromHTML} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import React, {useState, useEffect, useRef} from 'react';
import { isElementOfType } from 'react-dom/test-utils';

const {hasCommandModifier} = KeyBindingUtil;
const MediaComponent = (props) => {
  const {block, contentState} = props;
  const {foo} = props.blockProps;
  // Return a <figure> or some other content using this data.
  return <div style={{ border: "1px solid #f00" }} className="flex fdr aic">
    <input type="checkbox" style={{width:30, height:30,}}/>
    <EditorBlock {...props} />
  </div>
}

const Card = ({uuid, createNewCard, 
  updateId, 
  updateData,
  initContentState,
  findPrevCard, 
  findNextCard, 
  currentId, 
  onCheckBox, 
  initCardType, initIndentCnt}) => {
  const editorRef = useRef();
  const editorWrapperRef = useRef();

  let defaultEditorState
  if(initContentState){
    defaultEditorState = EditorState.createWithContent(convertFromRaw(initContentState));
  }else{
    defaultEditorState = EditorState.createEmpty()
  }

  const [editorState, setEditorState] = useState(defaultEditorState);  
  
  /*
  const blocksFromHTML = convertFromHTML(sampleMarkup);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap,
  );
  */

  // const initState = EditorState.createWithContent(state);
  // const [editorState, setEditorState] = useState(initState);

  const [hasEnded, setHasEnded] = useState(false);
  const [endCnt, setEndCnt] = useState(0);
  const [toolbox, setToolbox] = useState(null)    
  const [cardType, setCardType] = useState(initCardType || 'paragraph');
  const [indentCnt, setIndentCnt] = useState(initIndentCnt || 0);
  const [myTimeout, setMyTimeout] = useState(null);
  const [timeState, setTimeState] = useState(null);

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

  //여기서 우리가 해야 할 것은.. 키보드를 리스닝 하는 것.

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


  // useEffect(() => {
  //   //typing..
  //   //
  // }, [])
   
  

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
      // setEditorState(EditorState.forceSelection(editorState, SelectionState.createEmpty('')))
    }else {
      try{
        var selected = getSelected();
        var rect = selected.getRangeAt(0).getBoundingClientRect();
        setToolbox({left: rect.left, top: rect.top - 50, width: rect.width})
      }catch(e){
        console.log('error');
        setToolbox(null);
      }
    }

    //두개의 스테이트가 바뀌었었는지를 체크 하자...
    //내가 키보드를 바뀔 때 마다아~~
    //스테이트가 바뀔 떄마다아~ 
    //키보드 바뀔 떄마다아~
    


    // 에디터 스테이트가 바뀔 때에..







  }, [editorState])

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
    focusEditor();
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
    if(editorRef.current){
      editorRef.current.focus();
      editorWrapperRef.current.scrollIntoView();
    }
  }

  function myBlockStyleFn(contentBlock) {
    const type = contentBlock.getType();

    if (type === 'blockquote') {
      return 'superFancyBlockquote';
    }
  }

  function myBlockRenderer(contentBlock) {
    const type = contentBlock.getType();
    if (type === 'atomic') {
      return {
        component: MediaComponent,
        editable: true,
        props: {
          foo: 'bar',
          done: true,
        },
      };
    }
  }

  const updateCurrentDraft = () => {
    const contentState = editorState.getCurrentContent();
    let raw = convertToRaw(contentState)
    raw.cardType = cardType
    raw.id = uuid
    raw.indentCnt = indentCnt;
    updateData(uuid, raw);
  }

  const myKeyBindingFn = (e) => {

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

    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {

      const contentState = editorState.getCurrentContent();
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

//          <div style={{width:30,}}><input type="checkbox" onClick={onClickCheckBox}/></div>          


  return (
    <div className="flex fdr" ref={editorWrapperRef}>      
      <div style={{width: indentCnt * 30,}}>
      </div>
      <div className="flex fdr f1" style={{padding:8, position:'relative',}} onClick={focusEditor}>
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
          <div style={{position:'fixed', left:toolbox.left, top:toolbox.top, width:200, height:50, zIndex:10,}}>
            <button onMouseDown={_onBoldClick}>Bold</button>
            <button onMouseDown={_onColor}>Red</button>
            <button onClick={_onBlockQuote}>blockQuote</button>
            <button onClick={_onAtomic}>Atomic</button>
            <button onMouseDown={_onClose}>Exit</button>
            <button onMouseDown={_highlight}>highlight</button>    
            <button onMouseDown={_onMoveToEnd}>move focus</button>    
            <button onMouseDown={makeCheckBox}>checkbox</button>    
            <button onMouseDown={makeParagraph}>paragraph</button>    
          </div>
        }
        
        <Editor
          customStyleMap={styleMap}
          placeholder="Tell a story..."
          ref={editorRef}
          handleKeyCommand={handleKeyCommand}
          blockStyleFn={myBlockStyleFn} 
          blockRendererFn={myBlockRenderer} 
          editorState={editorState}
          onEscape={keyEvent=>console.log('Escape just  pressed')}
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
