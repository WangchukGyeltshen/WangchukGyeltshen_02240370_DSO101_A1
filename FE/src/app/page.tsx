"use client";

import { FormEvent, useState } from "react";

type Task = {
  id: number;
  text: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTask = newTask.trim();

    if (!trimmedTask) {
      return;
    }

    setTasks((previousTasks) => [
      ...previousTasks,
      { id: Date.now(), text: trimmedTask },
    ]);
    setNewTask("");
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveTask = (taskId: number) => {
    const trimmedText = editingText.trim();

    if (!trimmedText) {
      return;
    }

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, text: trimmedText } : task,
      ),
    );
    setEditingTaskId(null);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  const deleteTask = (taskId: number) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId),
    );

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  };

  return (
    <main
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "32px 16px",
        display: "grid",
        gap: "16px",
      }}
    >
      <h1>Task Manager</h1>

      <form onSubmit={addTask} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Add a new task"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #b5b5b5",
            borderRadius: "6px",
          }}
        />
        <button
          type="submit"
          style={{ padding: "10px 14px", borderRadius: "6px", border: "none" }}
        >
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", display: "grid", gap: "10px" }}>
        {tasks.map((task) => {
          const isEditing = editingTaskId === task.id;

          return (
            <li
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px",
                border: "1px solid #d8d8d8",
                borderRadius: "6px",
              }}
            >
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      border: "1px solid #b5b5b5",
                      borderRadius: "6px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => saveTask(task.id)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "none" }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    style={{ padding: "8px 12px", borderRadius: "6px" }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{task.text}</span>
                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    style={{ padding: "8px 12px", borderRadius: "6px" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    style={{ padding: "8px 12px", borderRadius: "6px" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
