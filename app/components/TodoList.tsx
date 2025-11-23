"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string | null;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data.todos || []);
        setLoading(false);
      });
  }, []);

  const handleAdd = async () => {
    if (!newTodo.trim()) return;

    // Optimistic Update
    const tempId = Date.now().toString();
    const optimisticTodo: Todo = {
      id: tempId,
      title: newTodo,
      isCompleted: false,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    setTodos([optimisticTodo, ...todos]);
    setNewTodo("");
    setDueDate("");

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: optimisticTodo.title,
          priority,
          dueDate,
        }),
      });

      if (res.ok) {
        const { todo } = await res.json();
        setTodos((prev) => prev.map((t) => (t.id === tempId ? todo : t)));
      }
    } catch (e) {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !currentStatus } : t))
    );

    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !currentStatus }),
    });
  };

  const deleteTodo = async (id: string) => {
    const backup = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) setTodos(backup);
  };

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return "text-red-400 border-red-400/50 bg-red-400/10";
    if (p === "LOW")
      return "text-green-400 border-green-400/50 bg-green-400/10";
    return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
  };

  return (
    <div className="h-full flex flex-col bg-krakedblue/20 border border-krakedlight/20 rounded-xl p-6 shadow-lg backdrop-blur-md overflow-hidden">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-6 h-6 text-green-400" />
        Tasks
      </h3>

      {/* Input Area */}
      <div className="flex flex-col gap-3 mb-6 p-4 bg-black/20 rounded-lg border border-white/5">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a new task..."
          className="bg-transparent border-b border-gray-600 p-2 text-white focus:border-green-500 outline-none placeholder:text-gray-500"
        />

        <div className="flex gap-3 items-center">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-gray-800 text-xs text-white px-3 py-1.5 rounded border border-gray-600 outline-none focus:border-green-500"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-gray-800 text-xs text-white px-3 py-1.5 rounded border border-gray-600 outline-none focus:border-green-500 scheme-dark"
          />

          <button
            onClick={handleAdd}
            className="ml-auto bg-green-600 hover:bg-green-500 text-white p-2 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading tasks...</p>
        ) : todos.length === 0 ? (
          <div className="text-center text-gray-500 py-8 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
            <p>No tasks yet. Stay focused!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                todo.isCompleted
                  ? "bg-black/20 border-transparent opacity-60"
                  : "bg-krakedblue/10 border-white/5 hover:border-white/10 hover:bg-krakedblue/20"
              }`}
            >
              <button
                onClick={() => toggleComplete(todo.id, todo.isCompleted)}
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                {todo.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`truncate ${
                    todo.isCompleted
                      ? "line-through text-gray-500"
                      : "text-white"
                  }`}
                >
                  {todo.title}
                </p>
                <div className="flex gap-2 mt-1 text-[10px] uppercase tracking-wider font-bold">
                  <span
                    className={`px-1.5 py-0.5 rounded border ${getPriorityColor(
                      todo.priority
                    )}`}
                  >
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(todo.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
