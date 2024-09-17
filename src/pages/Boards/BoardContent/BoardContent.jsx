/* eslint-disable react/prop-types */
import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
import { DndContext,/*PointerSensor,*/MouseSensor,TouchSensor,useSensor,useSensors,DragOverlay, defaultDropAnimationSideEffects, closestCorners, /*closestCenter,*/ pointerWithin, /*rectIntersection,*/ getFirstCollision } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { cloneDeep, isEmpty } from 'lodash'
import { useCallback } from "react";
import { generatePlacholderCard } from "~/utils/formatters";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  // https://docs.dndkit.com/api-documentation/sensors
  // Nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính CSS touch-action: none ở những phần tử kéo thả - nhưng mà còn bug
  // const pointerSensor = useSensor(PointerSensor, {activationConstraint: {distance: 10}})

  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, {activationConstraint: {distance: 10}})

  // Nhấn giữ 250ms và dung sai của cảm ứng 500px (dễ hiểu là di chuyển/chênh lệch 5px) thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {activationConstraint: {delay: 250, tolerance: 500}})

  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug.
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns,board?.columnOrderIds, '_id'))
  }, [board])

  // Cùng một thời điểm chỉ có một phần tử đang được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng trước đó (xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null)

  // Tìm một cái Column theo CardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước
    // handleDragOver chúng ta sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo
    // ra cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // function chung xử lý việc cập nhật lại state trong trường hợp di chuyển card giữa các column khác nhau.
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1;

      // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // Column cũ
      if (nextActiveColumn) {
        // Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        
        // Thêm Placeholder Card nếu Column rỗng: Bị kéo hết Card đi, không còn cái nào nữa.
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlacholderCard(nextActiveColumn)]
        }

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        
        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        // Xóa cái Placeholder Card đi nếu nó đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceHolderCard)
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ',event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
    // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if(event?.active?.data?.current?.columnId){
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo (drag) một phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo Column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    // Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver: ', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over
  
    // Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // Vì đây đang là đoạn xử lý lúc kéo (handleDragOver), còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }

  // Trigger khi kết thúc hành động kéo (drag) một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì (tránh crash trang)
    if (!active || !over) return

    // Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // activeDraggingCard: là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over
    
      // Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)
  
      // Nếu không tồn tại 1 trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id 
      // (set vào state từ bước handleDragStart) chứ không  phải activeData trong 
      // scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card
      // đã bị cập nhật một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // Hành động kéo thả card qua 2 column khác nhau
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // Hành động kéo thả card trong cùng một cái column
        // Lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex( c => c._id === activeDragItemId)
        // Lấy vị trí mới (từ thằng overColumn)
        const newCardIndex = overColumn?.cards?.findIndex( c => c._id === overCardId)
        // Dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards,oldCardIndex,newCardIndex)
        
        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return - cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới cái Column mà chúng ta đang thả
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          // Trả về state mới (chuẩn vị trí)
          return nextColumns
        })
      }
    }
    // Xử lý kéo thả Columns trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ (từ thằng active)
        const oldColumnIndex = orderedColumns.findIndex( c => c._id === active.id)
        // Lấy vị trí mới (từ thằng over)
        const newColumnIndex = orderedColumns.findIndex( c => c._id === over.id)
      
        // Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
        // Code của arrayMove ở đây: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns,oldColumnIndex,newColumnIndex)
        // 2 cái console.log dữ liệu này sau dùng để xử lý gọi API
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns: ', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds)

        // Cập nhật lại state columns ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }


    // Những dữ liệu sau khi kéo thả này luôn đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  // Animation khi thả (Drop) phần tử - Test bằng cách kéo xong thả trực tiếp và nhìn phần giữ chỗ Overlay
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
  }

  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều columns
  // args = arguments = Các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán closestCorners là chuẩn nhất
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)
    
    // Nếu pointer Intersections là mảng rỗng, return luôn không làm gì hết
    // Fix triệt để cái bug flickering của thư viện Dnd-kit trong trường hợp sau:
    // - Kéo một cái card có image cover lớn và kéo lên phía trên cùng ra khỏi khu vực kéo tả
    if (!pointerIntersections?.length) return

    // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)
    
    // Tìm overId đầu tiên trong đám intersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      // Nếu cái over nó là column thì sẽ tìm tới cái cardId gần nhất bên trong
      // khu vực va chạm đó dựa vào thuật toán phát hiện va chạm closestCenter hoặc
      // closestCorners đều được. Tuy nhiên ở đây dùng closestCorners mình thấy mượt mà hơn
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    // Nếu overId là null thì trả về mảng rỗng  - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])
  return (
    <DndContext 
    // Cảm biến
    sensors={sensors}
    // Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua 
    // column được vì lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng 
    // closestCorners thay vì closestCenter
    // Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
    // collisionDetection={closestCorners}

    // Tự custom nâng cao thuật toán phát hiện va chạm
    collisionDetection={collisionDetectionStrategy}


    onDragStart={handleDragStart}
    onDragOver={handleDragOver}
    onDragEnd={handleDragEnd}
    >
      <Box sx={{
        width: '100%',
        height: (theme) => theme.taskbroad.boardContentHeight,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1f1f1f' : '#f2f2f2'),
        p: '10px 0'
      }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData} />}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
