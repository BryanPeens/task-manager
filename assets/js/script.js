// Retrieve tasks and nextId from localStorage or initialize empty array and default ID value
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Function to generate a unique task ID and update nextId in localStorage
function generateTaskId() {
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return nextId++;
}

// Function to create a task card based on task data
function createTaskCard({ id, title, description, dueDate, status }) {
  const taskCard = $('<div>').addClass('card w-75 task-card draggable my-3').attr('data-task-id', id);
  const cardHeader = $('<div>').addClass('card-header h4').text(title);
  const cardBody = $('<div>').addClass('card-body');
  const cardText = $('<p>').addClass('card-text').text(description + ' - ' + dueDate);
  const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', id);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Set card background color based on due date and status
  if (dueDate && status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(dueDate, 'DD/MM/YYYY');
    taskCard.toggleClass('bg-warning text-white', now.isSame(taskDueDate, 'day'))
            .toggleClass('bg-danger text-white', now.isAfter(taskDueDate))
            .toggleClass('border-light', now.isAfter(taskDueDate));
  }

  // Append card elements
  cardBody.append(cardText, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Function to render task lists in different status lanes
function renderTaskList() {
  const todoList = $('#todo-cards');
  const inProgressList = $('#in-progress-cards');
  const doneList = $('#done-cards');

  // Empty existing task cards
  todoList.empty();
  inProgressList.empty();
  doneList.empty();

  // Loop through tasks and create task cards for each status
  for (let task of taskList) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  // Make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable') ? $(e.target) : $(e.target).closest('.ui-draggable');
      return original.clone().css({maxWidth: original.outerWidth()});
    },
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // Create a new task object
  const task = {
    id: generateTaskId(),
    title: $('#title').val(),
    description: $('#taskDescription').val(),
    dueDate: $('#taskDueDate').val(),
    status: 'to-do',
  };

  // Add the new task to the taskList, save to localStorage, and render
  taskList.push(task);
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();

  // Clear input fields
  $('#title, #taskDescription, #taskDueDate').val('');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  event.preventDefault();
  const taskId = $(this).attr('data-task-id');

  // Remove the task from the taskList, save to localStorage, and render
  taskList = taskList.filter((task) => task.id !== parseInt(taskId));
  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr('data-task-id');
  const newStatus = event.target.id;

  // Update the task status of the dragged card, save to localStorage, and render
  for (let task of taskList) {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Function to initialize when the document is ready
$(document).ready(function () {
  // Render the task list
  renderTaskList();

  // Add event listener for adding a new task
  $('#taskForm').on('submit', handleAddTask);

  // Make lanes droppable for task cards
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Make due date field a date picker
  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
