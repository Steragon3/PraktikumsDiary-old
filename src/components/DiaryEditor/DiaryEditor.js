import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import styles from './DiaryEditor.module.scss';
import DiaryEntry from '../DiaryEntry/DiaryEntry'
import DiaryActions from '../DiaryActions/DiaryActions'
import DeleteEntry from '../DeleteEntry/DeleteEntry'
import {Droppable, DragDropContext} from 'react-beautiful-dnd'
import deletestyles from '../DeleteEntry/DeleteEntry.module.scss'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {updateDiary, fetchDiary} from '../../store/actions/diaryActions'
import {Link} from "react-router-dom"

const DiaryEditorPresentation = ({diary, onLoadData, onupdateDiary}) => {
  let [data, setItems] = useState([])

  useEffect(() => {onLoadData().then((d) => {
    setItems(d.entries)
  })}, [])
  
  // if(data.length == 0) setItems(Array.from(initialData))

  let onDragEnd = (result) => {
    if(!result.destination) return;
    
    if(result.destination.droppableId == 'bucket'){
      deleteItem(result.source.index)
    }else{
      let tempitems = Array.from(data)
      const [reorderedItem] = tempitems.splice(result.source.index,1)
      tempitems.splice(result.destination.index, 0, reorderedItem)
      // setItems(tempitems)
      updateLevels(tempitems)
    }
  }

  const updateItem = (index, item) => {
    let items = Array.from(data)
    items[index] = item
    setItems(items)
  }

  const updateLevels = (items) => {
    let tempitems = [...items]
    console.log(tempitems)
    items.forEach((element, index) => {
      if(element.type == 'Text'){

        let found = false
        for(var i = index-1; i >= 0 && !found; i--){
          if(items[i].type == 'Heading'){
            console.log(items[i].level, parseInt(items[i].level) + 1)
            tempitems[index].level = parseInt(items[i].level) + 1
            found = true
            console.log(i, index)
          }
        }
        if(!found) tempitems[index].level = 1
      }
      
    })

    setItems(tempitems)
    console.log(tempitems)
  }

  const swapItems = (aInd, bInd) => {
    if(bInd < 0 || bInd > data.length-1){
    }else{
      console.log(aInd, bInd)
      let items = Array.from(data)
      let temp = items[bInd]
      items[bInd] = items[aInd]
      items[aInd] = temp

      // setItems(items)
      updateLevels(items)
    }
  }

  const deleteItem = (index) => {
    let tempitems = Array.from(data)
    tempitems.splice(index, 1)
    // setItems(tempitems)
    updateLevels(tempitems)
  }

  const addItem = (item) => {
    item.id=data.length+1

    let items = Array.from(data)
    items.push(item)
    updateLevels(items)
  }


  return (
  <div className={styles.DiaryEditor}>
    <DragDropContext
          onDragEnd={onDragEnd} >

          <Droppable droppableId="entries">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={styles.EntryLists} >
                  { data.map((entry, index) => {
                    return <DiaryEntry key={entry.id} entry={entry} index={index} onchange={updateItem} swapItems={swapItems} deleteItem={deleteItem}></DiaryEntry>
                  })}
                  {provided.placeholder}
                </div>
              )}
          </Droppable>
          <DiaryActions addItem={addItem}></DiaryActions>
          <Droppable droppableId="bucket">
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={deletestyles.DeleteEntry}>
                  <DeleteEntry></DeleteEntry>
                  {provided.placeholder}
                </div>
              )}
          </Droppable>
        </DragDropContext>

      <button className={styles.mainbutton} onClick={() => {onupdateDiary({entries: data})}}>
        Save
      </button>
      <Link to="/export" className="btn btn-primary">Export</Link>
  </div>
  )
}

// DiaryEditor.propTypes = {};

// DiaryEditor.defaultProps = {};


const mapStateToProps = (state) => {
  return {
    diary: state.diary
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadData: async () => {
      return await dispatch(fetchDiary())
    },
    onupdateDiary: async (diary) => {dispatch(updateDiary(diary))}
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(DiaryEditorPresentation);
