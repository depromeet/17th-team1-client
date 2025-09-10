'use client';

import { useState } from 'react';

export default function Home() {
  const [todoText, setTodoText] = useState('');
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([]);

  const addTodo = () => {
    if (todoText.trim()) {
      setTodos([...todos, { id: Date.now(), text: todoText, completed: false }]);
      setTodoText('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            모던 할 일 관리
          </h1>
          
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="새로운 할 일을 입력하세요..."
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-600 dark:bg-gray-700 focus:border-purple-400 focus:outline-none transition-all duration-200 text-lg"
            />
            <button
              onClick={addTodo}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg"
            >
              추가
            </button>
          </div>

          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl">할 일을 추가해보세요!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                    todo.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-lg ${
                    todo.completed 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            총 {todos.length}개의 할 일 | 완료: {todos.filter(t => t.completed).length}개
          </div>
        </div>
      </div>
    </div>
  );
}
