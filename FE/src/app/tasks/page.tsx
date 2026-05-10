"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, Space_Grotesk } from "next/font/google";
import styles from "./page.module.css";

const headingFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

type Task = {
  id: string;
  text: string;
};

type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  token?: string;
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const apiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000";

  const displayName = useMemo(() => {
    if (user?.name) {
      return user.name.split(" ")[0];
    }
    return user?.email ?? "Tasker";
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem("taskflow_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as UserProfile;
      setUser(parsedUser);
      if (parsedUser.token) {
        setToken(parsedUser.token);
      }
    }

    const storedToken = localStorage.getItem("taskflow_token");
    if (storedToken) {
      setToken(storedToken);
    }

    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!token) {
      router.replace("/auth");
    }
  }, [authReady, router, token]);

  useEffect(() => {
    if (!authReady || !token) {
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(`${apiBase}/api/tasks`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const payload = (await response.json()) as {
          data?: { id: string; text: string }[];
          message?: string;
        };

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          setStatus(payload.message ?? "Unable to load tasks.");
          return;
        }

        setTasks(payload.data ?? []);
      } catch (error) {
        setStatus("Unable to reach the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [apiBase, authReady, token]);

  const addTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTask = newTask.trim();

    if (!trimmedTask) {
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { id: tempId, text: trimmedTask };

    setTasks((previousTasks) => [optimisticTask, ...previousTasks]);
    setNewTask("");

    try {
      const response = await fetch(`${apiBase}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: trimmedTask }),
      });
      const payload = (await response.json()) as {
        data?: { id: string; text: string };
        message?: string;
      };

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !payload.data) {
        setStatus(payload.message ?? "Unable to add task.");
        setTasks((previousTasks) =>
          previousTasks.filter((task) => task.id !== tempId),
        );
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === tempId ? payload.data! : task,
        ),
      );
    } catch (error) {
      setStatus("Unable to reach the server.");
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== tempId),
      );
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveTask = async (taskId: string) => {
    const trimmedText = editingText.trim();

    if (!trimmedText) {
      return;
    }

    setPendingIds((previous) => new Set(previous).add(taskId));
    const previousTasks = tasks;
    setTasks((existing) =>
      existing.map((task) =>
        task.id === taskId ? { ...task, text: trimmedText } : task,
      ),
    );

    try {
      const response = await fetch(`${apiBase}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: trimmedText }),
      });
      const payload = (await response.json()) as {
        data?: { id: string; text: string };
        message?: string;
      };

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok || !payload.data) {
        setStatus(payload.message ?? "Unable to update task.");
        setTasks(previousTasks);
        return;
      }

      setTasks((existing) =>
        existing.map((task) => (task.id === taskId ? payload.data! : task)),
      );
      setEditingTaskId(null);
      setEditingText("");
    } catch (error) {
      setStatus("Unable to reach the server.");
      setTasks(previousTasks);
    } finally {
      setPendingIds((previous) => {
        const next = new Set(previous);
        next.delete(taskId);
        return next;
      });
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = tasks;
    setTasks((existing) => existing.filter((task) => task.id !== taskId));

    try {
      const response = await fetch(`${apiBase}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok && response.status !== 204) {
        const payload = (await response.json()) as { message?: string };
        setStatus(payload.message ?? "Unable to delete task.");
        setTasks(previousTasks);
        return;
      }

      if (editingTaskId === taskId) {
        cancelEditing();
      }
    } catch (error) {
      setStatus("Unable to reach the server.");
      setTasks(previousTasks);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("taskflow_user");
    localStorage.removeItem("taskflow_token");
    router.push("/auth");
  };

  return (
    <main className={`${styles.page} ${headingFont.variable} ${bodyFont.variable}`}>
      <section className={styles.card}>
        <header className={styles.header}>
          <p className={styles.kicker}>TaskFlow</p>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Your task board</h1>
            <div className={styles.headerActions}>
              <span className={styles.chip}>{tasks.length} active</span>
              <span className={styles.userChip}>Hi, {displayName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.buttonGhost}
              >
                Log out
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>
            Capture what matters today, then stay in motion. Edit and refine as you go.
          </p>
        </header>

        <form onSubmit={addTask} className={styles.form}>
          <div className={styles.fieldRow}>
            <input
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Add a new task"
              className={styles.input}
            />
            <button type="submit" className={styles.buttonPrimary}>
              Add task
            </button>
          </div>
        </form>

        {status && <p className={styles.status}>{status}</p>}

        {isLoading && (
          <div className={styles.emptyState}>Loading your tasks...</div>
        )}

        {!isLoading && tasks.length === 0 ? (
          <div className={styles.emptyState}>
            No tasks yet. Start by adding your first focus item above.
          </div>
        ) : (
          <ul className={styles.list}>
            {tasks.map((task) => {
              const isEditing = editingTaskId === task.id;

              return (
                <li key={task.id} className={styles.item}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        className={styles.input}
                      />
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => saveTask(task.id)}
                          className={styles.buttonPrimary}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className={styles.buttonGhost}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={styles.itemText}>
                        {task.text}
                        {pendingIds.has(task.id) ? " (Saving...)" : ""}
                      </span>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className={styles.buttonGhost}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className={`${styles.buttonGhost} ${styles.buttonDanger}`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
