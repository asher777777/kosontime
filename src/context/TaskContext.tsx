import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Task, InboxItem, MicroTask } from '../types';
import { sound } from '../utils/audio';
import { fireTaskConfetti, fireBigCelebration } from '../utils/confetti';

interface AttemptedTaskPayload {
  title: string;
  estimatedMinutes?: number;
  originInboxId?: string;
  sourceMicroTaskId?: string;
}

interface TaskContextType {
  todayTasks: Task[];
  inbox: InboxItem[];
  microTasks: MicroTask[];
  loading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  // Warning modal for 4th task
  attemptedTask: AttemptedTaskPayload | null;
  clearAttemptedTask: () => void;
  // Actions
  addTodayTask: (title: string, estimatedMinutes?: number, originInboxId?: string) => Promise<boolean>;
  replaceTodayTask: (oldTaskId: string, newTitle: string, estimatedMinutes?: number) => Promise<void>;
  toggleCompleteTodayTask: (task: Task) => Promise<void>;
  deleteTodayTask: (taskId: string) => Promise<void>;
  reorderTodayTasks: (orderedTasks: Task[]) => Promise<void>;
  addInboxItem: (title: string, note?: string) => Promise<string>;
  deleteInboxItem: (inboxId: string) => Promise<void>;
  saveDecomposition: (inboxId: string, subtasks: { title: string; estimatedMinutes: number }[]) => Promise<void>;
  addDirectMicroTask: (title: string, estimatedMinutes: number) => Promise<void>;
  deleteMicroTask: (microTaskId: string) => Promise<void>;
  promoteMicroTaskToToday: (microTask: MicroTask) => Promise<boolean>;
  scheduleMicroTaskForTomorrow: (microTaskId: string) => Promise<void>;
  moveTaskToInbox: (task: Task) => Promise<void>;
  applyTomorrowBig3: (selectedMicroTasks: MicroTask[]) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [attemptedTask, setAttemptedTask] = useState<AttemptedTaskPayload | null>(null);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sound.setEnabled(val);
  };

  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Real-time Firestore subscriptions for authenticated user
  useEffect(() => {
    if (!user) {
      setTodayTasks([]);
      setInbox([]);
      setMicroTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const todayStr = getTodayDateString();

    // 1. Today Tasks subscription
    const todayQuery = query(
      collection(db, 'todayTasks'),
      where('userId', '==', user.uid)
    );
    const unsubToday = onSnapshot(
      todayQuery,
      (snapshot) => {
        const tasks: Task[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          // Filter to today's date
          if (data.date === todayStr) {
            tasks.push({
              id: d.id,
              title: data.title,
              completed: Boolean(data.completed),
              completedAt: data.completedAt,
              estimatedMinutes: data.estimatedMinutes,
              priorityIndex: data.priorityIndex || 1,
              originInboxId: data.originInboxId,
              date: data.date,
              createdAt: data.createdAt,
            });
          }
        });
        tasks.sort((a, b) => a.priorityIndex - b.priorityIndex);
        setTodayTasks(tasks);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'todayTasks');
      }
    );

    // 2. Inbox Items subscription
    const inboxQuery = query(
      collection(db, 'inbox'),
      where('userId', '==', user.uid)
    );
    const unsubInbox = onSnapshot(
      inboxQuery,
      (snapshot) => {
        const items: InboxItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            title: data.title,
            note: data.note,
            createdAt: data.createdAt,
            decomposed: Boolean(data.decomposed),
            microTasks: data.microTasks,
          });
        });
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setInbox(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'inbox');
      }
    );

    // 3. MicroTasks subscription
    const microTasksQuery = query(
      collection(db, 'microTasks'),
      where('userId', '==', user.uid)
    );
    const unsubMicro = onSnapshot(
      microTasksQuery,
      (snapshot) => {
        const items: MicroTask[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            inboxItemId: data.inboxItemId,
            inboxItemTitle: data.inboxItemTitle,
            title: data.title,
            estimatedMinutes: data.estimatedMinutes,
            scheduledFor: data.scheduledFor,
            createdAt: data.createdAt,
          });
        });
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setMicroTasks(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'microTasks');
      }
    );

    return () => {
      unsubToday();
      unsubInbox();
      unsubMicro();
    };
  }, [user]);

  // Strict Rule of 3 check
  const addTodayTask = async (
    title: string,
    estimatedMinutes = 25,
    originInboxId?: string
  ): Promise<boolean> => {
    if (!user) return false;
    const cleanTitle = title.trim();
    if (!cleanTitle) return false;

    // Check if already 3 tasks exist for today
    if (todayTasks.length >= 3) {
      sound.playWarning();
      setAttemptedTask({ title: cleanTitle, estimatedMinutes, originInboxId });
      return false;
    }

    const taskId = 'task_' + Date.now();
    const todayStr = getTodayDateString();
    const priorityIndex = todayTasks.length + 1;

    try {
      await setDoc(doc(db, 'todayTasks', taskId), {
        userId: user.uid,
        title: cleanTitle,
        completed: false,
        priorityIndex,
        estimatedMinutes,
        originInboxId: originInboxId || '',
        date: todayStr,
        createdAt: new Date().toISOString(),
      });
      sound.playPop();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `todayTasks/${taskId}`);
      return false;
    }
  };

  const replaceTodayTask = async (
    oldTaskId: string,
    newTitle: string,
    estimatedMinutes = 25
  ) => {
    if (!user) return;
    const oldTask = todayTasks.find((t) => t.id === oldTaskId);
    if (!oldTask) return;

    try {
      // 1. Move old task back to Inbox so work is never lost
      const inboxId = 'inbox_' + Date.now();
      await setDoc(doc(db, 'inbox', inboxId), {
        userId: user.uid,
        title: oldTask.title,
        note: 'הועבר מ-היום שלי בעקבות חוק ה-3',
        decomposed: false,
        createdAt: new Date().toISOString(),
      });

      // 2. Update the slot with new title
      await updateDoc(doc(db, 'todayTasks', oldTaskId), {
        title: newTitle,
        completed: false,
        completedAt: '',
        estimatedMinutes,
        createdAt: new Date().toISOString(),
      });

      sound.playPop();
      setAttemptedTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todayTasks/${oldTaskId}`);
    }
  };

  const toggleCompleteTodayTask = async (task: Task) => {
    if (!user) return;
    const nextState = !task.completed;
    const completedAt = nextState ? new Date().toISOString() : '';

    try {
      await updateDoc(doc(db, 'todayTasks', task.id), {
        completed: nextState,
        completedAt,
      });

      if (nextState) {
        sound.playTaskComplete();
        fireTaskConfetti();

        // Check if all 3 are completed
        const otherCompletedCount = todayTasks.filter(
          (t) => t.id !== task.id && t.completed
        ).length;
        if (otherCompletedCount + 1 >= 3) {
          setTimeout(() => {
            sound.playFanfare();
            fireBigCelebration();
          }, 350);
        }
      } else {
        sound.playPop();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todayTasks/${task.id}`);
    }
  };

  const deleteTodayTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'todayTasks', taskId));
      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `todayTasks/${taskId}`);
    }
  };

  const reorderTodayTasks = async (orderedTasks: Task[]) => {
    if (!user) return;
    try {
      for (let i = 0; i < orderedTasks.length; i++) {
        const t = orderedTasks[i];
        await updateDoc(doc(db, 'todayTasks', t.id), {
          priorityIndex: i + 1,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'todayTasks/reorder');
    }
  };

  const addInboxItem = async (title: string, note?: string): Promise<string> => {
    if (!user) return '';
    const cleanTitle = title.trim();
    if (!cleanTitle) return '';

    const inboxId = 'inbox_' + Date.now();
    try {
      await setDoc(doc(db, 'inbox', inboxId), {
        userId: user.uid,
        title: cleanTitle,
        note: note || '',
        decomposed: false,
        createdAt: new Date().toISOString(),
      });
      sound.playPop();
      return inboxId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inbox/${inboxId}`);
      return '';
    }
  };

  const deleteInboxItem = async (inboxId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'inbox', inboxId));
      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inbox/${inboxId}`);
    }
  };

  const saveDecomposition = async (
    inboxId: string,
    subtasks: { title: string; estimatedMinutes: number }[]
  ) => {
    if (!user || subtasks.length === 0) return;
    const parent = inbox.find((i) => i.id === inboxId);
    const parentTitle = parent ? parent.title : '';

    try {
      // 1. Mark inbox item as decomposed
      if (parent) {
        await updateDoc(doc(db, 'inbox', inboxId), {
          decomposed: true,
          microTasks: subtasks.map((s, idx) => ({
            id: `m_${inboxId}_${idx}`,
            title: s.title,
            estimatedMinutes: s.estimatedMinutes,
          })),
        });
      }

      // 2. Save individual micro-tasks to microTasks collection
      for (let i = 0; i < subtasks.length; i++) {
        const s = subtasks[i];
        const microId = `m_${inboxId}_${Date.now()}_${i}`;
        await setDoc(doc(db, 'microTasks', microId), {
          userId: user.uid,
          inboxItemId: inboxId,
          inboxItemTitle: parentTitle,
          title: s.title,
          estimatedMinutes: s.estimatedMinutes,
          scheduledFor: 'pool',
          createdAt: new Date().toISOString(),
        });
      }

      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `inbox/${inboxId}`);
    }
  };

  const addDirectMicroTask = async (title: string, estimatedMinutes = 20) => {
    if (!user) return;
    const microId = 'm_direct_' + Date.now();
    try {
      await setDoc(doc(db, 'microTasks', microId), {
        userId: user.uid,
        inboxItemId: '',
        inboxItemTitle: '',
        title: title.trim(),
        estimatedMinutes,
        scheduledFor: 'pool',
        createdAt: new Date().toISOString(),
      });
      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `microTasks/${microId}`);
    }
  };

  const deleteMicroTask = async (microTaskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'microTasks', microTaskId));
      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `microTasks/${microTaskId}`);
    }
  };

  const promoteMicroTaskToToday = async (microTask: MicroTask): Promise<boolean> => {
    if (!user) return false;
    if (todayTasks.length >= 3) {
      sound.playWarning();
      setAttemptedTask({
        title: microTask.title,
        estimatedMinutes: microTask.estimatedMinutes,
        sourceMicroTaskId: microTask.id,
      });
      return false;
    }

    const success = await addTodayTask(
      microTask.title,
      microTask.estimatedMinutes,
      microTask.inboxItemId
    );
    if (success) {
      // Mark micro-task scheduled
      try {
        await updateDoc(doc(db, 'microTasks', microTask.id), {
          scheduledFor: 'today',
        });
      } catch (e) {
        console.error(e);
      }
    }
    return success;
  };

  const scheduleMicroTaskForTomorrow = async (microTaskId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'microTasks', microTaskId), {
        scheduledFor: 'tomorrow',
      });
      sound.playPop();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `microTasks/${microTaskId}`);
    }
  };

  const moveTaskToInbox = async (task: Task) => {
    if (!user) return;
    try {
      await addInboxItem(task.title, 'הועבר מסגירת יום');
      await deleteDoc(doc(db, 'todayTasks', task.id));
      sound.playPop();
    } catch (error) {
      console.error(error);
    }
  };

  const applyTomorrowBig3 = async (selectedMicroTasks: MicroTask[]) => {
    if (!user) return;
    // Calculates tomorrow's date string
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    try {
      for (let i = 0; i < selectedMicroTasks.length && i < 3; i++) {
        const m = selectedMicroTasks[i];
        const taskId = 'task_tmrw_' + Date.now() + '_' + i;
        await setDoc(doc(db, 'todayTasks', taskId), {
          userId: user.uid,
          title: m.title,
          completed: false,
          priorityIndex: i + 1,
          estimatedMinutes: m.estimatedMinutes,
          originInboxId: m.inboxItemId || '',
          date: tomorrowStr,
          createdAt: new Date().toISOString(),
        });
        // Update microtask
        await updateDoc(doc(db, 'microTasks', m.id), {
          scheduledFor: 'tomorrow',
        });
      }
      sound.playFanfare();
      fireBigCelebration();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'todayTasks/tomorrow');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        todayTasks,
        inbox,
        microTasks,
        loading,
        soundEnabled,
        setSoundEnabled,
        attemptedTask,
        clearAttemptedTask: () => setAttemptedTask(null),
        addTodayTask,
        replaceTodayTask,
        toggleCompleteTodayTask,
        deleteTodayTask,
        reorderTodayTasks,
        addInboxItem,
        deleteInboxItem,
        saveDecomposition,
        addDirectMicroTask,
        deleteMicroTask,
        promoteMicroTaskToToday,
        scheduleMicroTaskForTomorrow,
        moveTaskToInbox,
        applyTomorrowBig3,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
