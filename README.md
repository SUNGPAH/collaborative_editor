- [done] how to apply blockquote
- [done] when changing the state, highlight stay? -> onMouseDown + preventDefault();
- [done] bold를 누르고 나면, 그다음 부터 쳐지는 것은 바뀌어야 할텐데! 어떻게 하지?
- [half] custom block rendering.
- [done] when enter -> new thing. -> use props.
- [done] 현재 상태에서 딜리트를 누르면, 위로 올라가서, 위에거 하나씩 지우게 되어야 함.
- [done] 키보드 아래로 내려가게. (하나의 카드에서 끝나면, 다음 카드로 가게끔)
- [done]위에서 엔터를 치면, 맨아래로 추가가 되는데, 현재것이 추가가 바로 아래에 되어야 함. -> 어떻게 구현할지 생각해보기. 
- [done] 텍스트의 왼쪽 끝에 왔을 때에!
- [done] 내려갈때! 다음 카드로 넘어가게 하자.
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

- [ ] how to ..send data..(difference)
  - snapshot! ..
  - listener install.
  - when updating -> let's use toast
  - 이제 부터는.. 업데이트를 3초에 한 번? 
  - 남은 투두 
    - 업데이트 할 때, 글자하나가 짤림.   
    - 지우기
  - outfocus -> currentId지우기.
- [ ] 상대방이 새로 생길 때에, 이게 리스터로 생긴거면, 만들어질 때에 포커스 되면 안됨.
  - 상대방에 의해 추가가 된건지가 명확해져야 함.

  //내가 하나를 더하면, 

- [ ] 지우는 걸 빨리 만들자..
  - 지우는 순간, 하나 지울 때 마다, 일단 트리를 업데이트를 하자. 
  - 이게 제일 난이도가 크다. 왜냐면, ... 이건 탑 레벨에서 결정을 해야 하기 때문.
생각을 해보자.

- 내가 뭔가를 지워서, 트리가 업데이트가 됐다.
- 트리가 업데이트 되면서, 그 상황을 파이어 스토어에 보낸다.
- 그러면 나를 비롯한 모든 사람들이 연락을 받는다.
  - 이때에, 내가 지금 작업을 하는 속도보다, 연락받는 속도가 무조건 느리기 때문에,
  - 내가 수정을 하고 있을 때에는, 트리 업데이트에 대해서 연락을 안받거나, 다른 조치를 해줘야 한다.

- 반면, 아무것도 안하고 있는 사람들의 경우, 트리가 업데이트 되고 있는 것이 잘 반영이 되게 하면 된다.
- 어떻게 룰을 정할까? - 가장 윗단에서 crdt이다.
- A가 지금 tree 구조를 바꾸고 있음.
  일단 리스닝 하는 사람들이 경우, 현재 tree와 다를 것이기 때문에, tree자체는 업데이트를 해줌. 
  - (각자 작업을 뭘 하고 있더라도 일단 해주는 것으로)
  - 다만, A는 변화를 안받고 싶음이 맞을까? 
    - 누구에 의해 지금 tree가 바뀌고 있는지를 알아야 할까? 
      - 누군가가 트리에 지금 변화를 주었다. 
      그건 해야 할 듯. 따라서 A가 구조를 바꿨다. -> A는 그것을 받지 않는다.
      다른 사람들은 상황 보고 바꾼다.


- [done] 엔터가 되면, 밑으로 내려가야 하는데, 그게 안됨!
  -  lesson learned -> newTree를 카피를 해도, 안에 있는 오브젝트를 카피를 하지 않으면 이뮤터블리티가 깨짐.. (몰랐음)
  -  const _tree = newTree.map(treeObj => {
      const copiedTreeObj = {...treeObj}
      if(!copiedTreeObj.content){
        delete copiedTreeObj.content;
      }
      if(copiedTreeObj.focus){
        delete copiedTreeObj.focus
      }
      return copiedTreeObj
    })
  