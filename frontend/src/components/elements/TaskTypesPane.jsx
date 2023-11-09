import { Button, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskTypeItem from './TaskTypeItem';
import { createTaskType, deleteTaskType } from '../../common/apiCalls';
import { setTaskTypes } from "../../common/redux/tasks-slice";
import CreateTaskTypeDialogue from './CreateTaskTypeDialogue';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert, createSuccessAlert, loadTaskTypes } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";

function TaskTypesPane() {
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const taskTypes = useSelector((state) => state.tasks.taskTypes);
  const dispatch = useDispatch();

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      console.log("WebSocket opened");
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.TASK_TYPES;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    async function callFetcher() {
      await loadTaskTypes();
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...taskTypes];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          updated.push(lastJsonMessage.entity);
          break;
        case eventTypes.DELETE:
          updated = updated.filter(taskType => taskType._id !== lastJsonMessage.entity._id);
          break;
      }

      dispatch(setTaskTypes(updated));
    }
  }, [lastJsonMessage]);

  const handleFormOpen = () => {
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    const response = await createTaskType(data);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      handleFormClose();
      await loadTaskTypes();
      createSuccessAlert("Successfully created task type");
    }
  }

  const handleDelete = async (taskType) => {
    const { errors } = await deleteTaskType(taskType._id);

    if (errors.length > 0) {
      createErrorAlert(errors);
    } else {
      await loadTaskTypes();
      createSuccessAlert("Successfully deleted task type");
    }

  }

  let taskTypesItems = null;

  if (taskTypes !== undefined && taskTypes !== null) {
    taskTypesItems = taskTypes.map(taskType => {
      return <TaskTypeItem taskType={taskType} key={taskType.order} deleteTaskType={() => handleDelete(taskType)} />
    });
  }

  return (
    <Container fixed>
      <Typography align="center" variant="h3">Task Types</Typography>
      <List>
        {taskTypesItems}
      </List>
      <Button variant='contained' onClick={handleFormOpen}>Create Task Type</Button>
      <CreateTaskTypeDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
      
  )
}

export default TaskTypesPane;