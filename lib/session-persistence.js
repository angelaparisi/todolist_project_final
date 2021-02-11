const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }
  
    // Are all of the todos in the todo list done? If the todo list has at least
  // one todo and all of its todos are marked as done, then the todo list is
  // done. Otherwise, it is undone.
  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }
  
  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }
  
  loadTodoList(todoListId) {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  }
  
  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }
  
  toggleTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (todo.done) {
      todo.done = false;
    } else {
      todo.done = true;
    }
  }
  
  deleteTodoList(todoListId) {
    let indexOfTodoList = this._todoLists.findIndex(todoList => todoList.id === todoListId);
    if (indexOfTodoList === -1) return false;
    
    this._todoLists.splice(indexOfTodoList, 1);
    return true;
  }
  
  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;
    
    let indexOfTodo = todoList.todos.findIndex(todo => todo.id === todoId);
    if (indexOfTodo === -1) return false;
    
    todoList.todos.splice(indexOfTodo, 1);
    return true;
  }
  
  completeAllTodos(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.forEach(todo => todo.done = true);
    return true;
  }
  
  addTodoList(todoListTitle) {
    let newTodoList = this._createNewTodoList(todoListTitle);
    this._todoLists.push(newTodoList);
    return true;
  }
  
  addTodo(todoListId, todoTitle) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;
    
    let newTodo = this._createNewTodo(todoTitle);
    
    todoList.todos.push(newTodo);
    return true;
  }
  // Returns a copy of the list of todo lists sorted by completion status and
  // title (case-insensitive).
  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }
  
  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter(todo => !todo.done);
    let done = todos.filter(todo => todo.done);
    return deepCopy(sortTodos(undone, done))
  }
  
  setTodoListTitle(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;
    
    todoList.title = title;
    return true;
  }
  
    // Returns `true` if a todo list with the specified title exists in the list
  // of todo lists, `false` otherwise.
  existsTodoListTitle(title) {
    return this._todoLists.some(todoList => todoList.title === title);
  }
  
  isUniqueConstraintViolation(_error) {
    return false;
  }
  
  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId);
  }
  
  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;
    
    return todoList.todos.find(todo => todo.id === todoId);
  }
  
  _createNewTodoList(todoListTitle) {
    return {
      id: nextId(),
      title: todoListTitle,
      todos: []
    }
  }
  
  _createNewTodo(todoTitle) {
    return {
      id: nextId(),
      title: todoTitle,
      done: false
    }
  }
};