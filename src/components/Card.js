import ReactDOM from 'react-dom';
import {Editor, EditorState, EditorBlock, SelectionState, convertToRaw, RichUtils, ContentState, convertFromHTML} from 'draft-js';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
import React, {useState, useEffect, useRef} from 'react';

const {hasCommandModifier} = KeyBindingUtil;

//[done] how to apply blockquote
//[done] when changing the state, highlight stay? -> onMouseDown + preventDefault();
//[done] bold를 누르고 나면, 그다음 부터 쳐지는 것은 바뀌어야 할텐데! 어떻게 하지?
//what is contentState.getEntity(someKey)
//[half] custom block rendering.
//[] how to apply the inline state (color change)
//[] when deleting.. go to the end of the previous element, instead of delting all.
//[done] when enter -> new thing. -> use props.
//[ ] if you are are at the end of the sentence, then move to next card.

const MediaComponent = (props) => {
  const {block, contentState} = props;
  const {foo} = props.blockProps;
  // Return a <figure> or some other content using this data.
  return <div style={{ border: "1px solid #f00" }} className="flex fdr aic">
    <input type="checkbox" style={{width:30, height:30,}}/>
    <EditorBlock {...props} />
  </div>
}


const Card = ({uuid, createNewCard, updateId, sampleMarkup, findPrevCard, findNextCard, currentId}) => {
  const editorRef = useRef();
  // const [editorState, setEditorState] = useState(EditorState.createEmpty());  
  // const sampleMarkup = '';
  const blocksFromHTML = convertFromHTML(sampleMarkup);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap,
  );

  const initState = EditorState.createWithContent(state);
  const [editorState, setEditorState] = useState(initState);
  const [hasEnded, setHasEnded] = useState(false);
  const [endCnt, setEndCnt] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [toolbox, setToolbox] = useState(null)
    
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
  
  useEffect(() => {

    //if currentId is not uuid, then.. selection cancel.
    //if something!
    if(currentId !== uuid){
      //then remove selection..    
      // setEditorState(EditorState.forceSelection(editorState, SelectionState.createEmpty('')))
      // console.log(currentId);
      // console.log(uuid);
      // setEditorState(editorState => EditorState.moveFocusToEnd(editorState));
      //toolBox is something
    }else{
      console.log('현재..');
    }

  }, [currentId])

  useEffect(() => {
    if(hasEnded){
      setEndCnt(prev => prev + 1);
    }else{
      setEndCnt(0);
    }
  }, [hasEnded])

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

  /*
  1. 

  */
  
  useEffect(() => {

    //state가 바뀔 때마다...
    
    var selection = editorState.getSelection();
    
    // if(currentId === uuid){
      
    // }else{
    //   console.log('different');        
    // }

    if (selection.isCollapsed()) {
      setToolbox(null);
    }else {
      try{
        var selected = getSelected();
        var rect = selected.getRangeAt(0).getBoundingClientRect();
        setToolbox({left: rect.left, top: rect.top, width: rect.width})
        
      }catch(e){
        console.log('error');
        setToolbox(null);
      }
    }
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

  /*
    if (contentBlock.getText() === 'Hii') {
  */

  const onChange = (editorState) => {
    setEditorState(editorState);
    updateId(uuid);
  }

  const focusEditor = () => {
    if(editorRef.current){
      editorRef.current.focus();
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

  const myKeyBindingFn = (e) => {
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
      return 'myeditor-save';
    }

    if (e.keyCode === 13){
      return 'split-block-new'
    }

    if (hasCommandModifier(e) && e.shiftKey && e.key === 'h') {
      return 'highlight';
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
      createNewCard();
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
        if(!currentContent.hasText()){
          findPrevCard(uuid, 'delete');
        }else{
          findPrevCard(uuid);
        }
      }
    }

    console.log('command');
    console.log(command);

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
    // evt.preventDefault();
    setEditorState(EditorState.forceSelection(editorState, SelectionState.createEmpty('')))
  }

  const styleMap = {
    'HIGHLIGHT': {
      'backgroundColor': '#faed27',
    }
  };

  return (
    <div>      
      <div style={{padding:8, position:'relative',}} onClick={focusEditor}>
        {
          toolbox &&
          <div style={{position:'absolute', left:toolbox.left, top:toolbox.top, width:200, height:50, zIndex:10,}}>
            <button onMouseDown={_onBoldClick}>Bold</button>
            <button onClick={_onBlockQuote}>blockQuote</button>
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
          blockRendererFn={myBlockRenderer} 
          editorState={editorState}
          onEscape={keyEvent=>console.log('Escape just  pressed')}
          onDownArrow={keyEvent => {
            downHandler(keyEvent)
          }}
          onUpArrow={keyEvent => {
            upHandler()
          }}
          onChange={onChange}
          keyBindingFn={myKeyBindingFn}
        />
      </div>
    </div>
  );
}

export default Card;
