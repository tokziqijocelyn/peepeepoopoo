"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface ActiveTask {
  id: string;
  label: string;
  type: "upload" | "generate";
}

interface TaskContextValue {
  tasks: ActiveTask[];
  addTask: (task: ActiveTask) => void;
  removeTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  addTask: () => {},
  removeTask: () => {},
});

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<ActiveTask[]>([]);

  const addTask = useCallback((task: ActiveTask) => {
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev;
      return [...prev, task];
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
