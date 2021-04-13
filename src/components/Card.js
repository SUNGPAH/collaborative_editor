import ReactDOM from 'react-dom';
import {Editor, EditorState, EditorBlock, convertToRaw, RichUtils, ContentState, convertFromHTML} from 'draft-js';
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

//when deleting, inside the custom components things are little weird..

//editorstate
  //getSelection
  //[done] moveSelectionToEnd
  //[done] moveFocusToEnd
//contentState
//blockState

const MediaComponent = (props) => {
  const {block, contentState} = props;
  const {foo} = props.blockProps;
  // Return a <figure> or some other content using this data.
  return <div style={{ border: "1px solid #f00" }} className="flex fdr aic">
    <input type="checkbox" style={{width:30, height:30,}}/>
    <EditorBlock {...props} />
  </div>
}


const Card = ({uuid, createNewCard}) => {
  const editorRef = useRef();
  // const [editorState, setEditorState] = useState(EditorState.createEmpty());  
  const sampleMarkup = '';
  const blocksFromHTML = convertFromHTML(sampleMarkup);
  const state = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap,
  );

  const initState = EditorState.createWithContent(state);
  const [editorState, setEditorState] = useState(initState);
  
  useEffect(() => {
    focusEditor();
  }, [])

  //custom block을 만드는 것은 어떻게 하지? 
/*
    if (contentBlock.getText() === 'Hii') {
*/

  const onChange = (editorState) => {
    setEditorState(editorState);
  }

  const focusEditor = () => {
    if(editorRef.current){
      editorRef.current.focus();
    }
  }

  useEffect(() => {
    const currentContent = editorState.getCurrentContent();
    const raw = convertToRaw(currentContent);
    console.log(raw);
  }, [editorState]);

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

    //ctrl+z를 누를 때에, 얼럿도 띄우고 싶다면, 여기서 다시 함수를 작성해야 함.
    return getDefaultKeyBinding(e);
  }
  
  const handleKeyCommand = (command, editorState) => {
    if (command === 'myeditor-save'){
      alert('saved! - I need to define custom method');
      return;
    }

    if(command === "split-block-new"){
      // alert('new');
      // we are going to create new one.
      createNewCard();

      return;
    }
    
    if (command === "split-block"){
      alert('split block..')
      //how to prevent enter here..?
      //현재 커서가 어딨는지에 따라서 이야기가 달라지면 되는거 인가

      return ;
    }

    if (command === "backspace"){
      // what am I deleting now?
      // console.log('when deleting');
      // console.log(editorState.getEntityAt(0));
      // const currentContent = editorState.getCurrentContent();
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      onChange(newState);
      return 'handled';
    }

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
    //oh I see!
    setEditorState(editorState => EditorState.moveFocusToEnd(editorState));
  }

  //can we build something like notion with this tool?

  return (
    <div>      
      <button onMouseDown={_onBoldClick}>Bold</button>
      <button onClick={_onBlockQuote}>blockQuote</button>
      <button onClick={_onAtomic}>Atomic</button>
      <button onMouseDown={_onMoveToEnd}>FocusMove</button>
      <div style={{border:'1px solid red', padding:40,}} onClick={focusEditor}>
        <Editor
          placeholder="Tell a story..."
          ref={editorRef}
          handleKeyCommand={handleKeyCommand}
          blockStyleFn={myBlockStyleFn} 
          blockRendererFn={myBlockRenderer} 
          editorState={editorState}
          onChange={onChange}
          keyBindingFn={myKeyBindingFn}
        />
      </div>
    </div>
  );
}

export default Card;
