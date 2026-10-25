/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { SwipeHomeScreen } from './components/SwipeHomeScreen';
import { TodayScreen } from './components/TodayScreen';
import { InboxScreen } from './components/InboxScreen';
import { DecomposeScreen } from './components/DecomposeScreen';
import { BrainstormScreen } from './components/BrainstormScreen';
import { EveningRitualModal } from './components/EveningRitualModal';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { RuleOf3WarningModal } from './components/RuleOf3WarningModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AuthScreen } from './components/AuthScreen';
import { ActiveScreen, InboxItem, Task } from './types';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading, logOut } = useAuth();
  const {
    todayTasks,
    inbox,
    microTasks,
    loading: tasksLoading,
    soundEnabled,
    setSoundEnabled,
    attemptedTask,
    clearAttemptedTask,
    addTodayTask,
    replaceTodayTask,
    toggleCompleteTodayTask,
    deleteTodayTask,
    addInboxItem,
    deleteInboxItem,
    saveDecomposition,
    promoteMicroTaskToToday,
    scheduleMicroTaskForTomorrow,
    moveTaskToInbox,
    applyTomorrowBig3,
  } = useTasks();

  // 'home' is now the primary home screen!
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isEveningRitualOpen, setIsEveningRitualOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedInboxForDecompose, setSelectedInboxForDecompose] = useState<InboxItem | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center p-4 text-[#F0F4FF]">
        <Loader2 className="w-10 h-10 text-[#00F0FF] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#F0F4FF] tracking-wider font-['Orbitron',sans-serif]">KOSUN</p>
        <p className="text-xs text-[#F0F4FF]/60 mt-1">טוען נתונים מאובטחים...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const completedCount = todayTasks.filter((t) => t.completed).length;

  const handleSelectInboxForDecomposition = (item: InboxItem) => {
    setSelectedInboxForDecompose(item);
    setActiveScreen('decompose');
  };

  const handlePostponeTaskToTomorrow = async (task: Task) => {
    await scheduleMicroTaskForTomorrow(task.id);
    await deleteTodayTask(task.id);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#F0F4FF] font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF]">
      {/* Top Sticky Header only shown on sub-screens to keep the home screen 100% immersive like the snippet */}
      {activeScreen !== 'home' && (
        <Navbar
          completedCount={completedCount}
          totalCount={todayTasks.length}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onStartRitual={() => setIsEveningRitualOpen(true)}
          user={user}
          onLogOut={logOut}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          showBackHome={true}
          onNavigateHome={() => setActiveScreen('home')}
        />
      )}

      {/* Main Content Area */}
      <main className={activeScreen === 'home' ? 'w-full' : 'max-w-2xl mx-auto px-4 pt-4 pb-24'}>
        {tasksLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#F0F4FF]/60">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#00F0FF]" />
            <span className="text-sm font-semibold">מסנכרן נכסים מ-Firebase NoSQL...</span>
          </div>
        ) : (
          <>
            {activeScreen === 'home' && (
              <SwipeHomeScreen
                todayTasks={todayTasks}
                inboxItems={inbox}
                onNavigateToToday={() => setActiveScreen('today')}
                onNavigateToInbox={() => setActiveScreen('inbox')}
                onNavigateToRitual={() => setIsEveningRitualOpen(true)}
                onOpenBrainstorm={() => setActiveScreen('brainstorm')}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
              />
            )}

            {activeScreen === 'today' && (
              <TodayScreen
                tasks={todayTasks}
                availableMicroTasks={microTasks}
                onToggleComplete={toggleCompleteTodayTask}
                onAddTask={(title, mins) => addTodayTask(title, mins)}
                onDeleteTask={deleteTodayTask}
                onPromoteMicroTask={promoteMicroTaskToToday}
                onOpenEveningRitual={() => setIsEveningRitualOpen(true)}
                onGoToInbox={() => setActiveScreen('inbox')}
                onGoToDecompose={() => setActiveScreen('decompose')}
              />
            )}

            {activeScreen === 'inbox' && (
              <InboxScreen
                items={inbox}
                onAddItem={(title, note) => addInboxItem(title, note)}
                onDeleteItem={deleteInboxItem}
                onSelectForDecomposition={handleSelectInboxForDecomposition}
                onPromoteToToday={(title) => addTodayTask(title)}
                onOpenBrainstorm={() => setActiveScreen('brainstorm')}
              />
            )}

            {activeScreen === 'brainstorm' && (
              <BrainstormScreen
                todayTasks={todayTasks}
                inboxItems={inbox}
                onAddToInbox={(title, note) => addInboxItem(title, note)}
                onAddToToday={(title) => addTodayTask(title)}
                onSendToDecompose={(title) => {
                  const item: InboxItem = {
                    id: 'temp_' + Date.now(),
                    title,
                    decomposed: false,
                    createdAt: new Date().toISOString(),
                  };
                  handleSelectInboxForDecomposition(item);
                }}
              />
            )}

            {activeScreen === 'decompose' && (
              <DecomposeScreen
                selectedItem={selectedInboxForDecompose}
                inboxItems={inbox}
                onSelectAnotherItem={(item) => setSelectedInboxForDecompose(item)}
                onSaveSubtasks={(inboxId, subtasks) => {
                  saveDecomposition(inboxId, subtasks);
                }}
                onGoToToday={() => setActiveScreen('today')}
              />
            )}

            {activeScreen === 'ritual' && (
              <div className="py-8 text-center space-y-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🌙</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    טקס תכנון ערב (Evening Ritual)
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    סגור את משימות היום, נקה את תיבת הקליטה ובחר בדיוק 3 משימות מפתח למחר לקראת שינה שלווה.
                  </p>
                </div>
                <button
                  onClick={() => setIsEveningRitualOpen(true)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  התחל עכשיו את טקס הערב
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick Capture Modal (Dump in 3 seconds with Voice Transcription) */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onSaveToInbox={(title, note) => addInboxItem(title, note)}
      />

      {/* Strict Rule of 3 Warning Modal (when 4th task is attempted) */}
      <RuleOf3WarningModal
        attemptedTask={attemptedTask}
        currentTasks={todayTasks}
        onClose={clearAttemptedTask}
        onReplaceTask={(oldId, newTitle, mins) => replaceTodayTask(oldId, newTitle, mins)}
        onPostponeToTomorrow={(title, mins) => {
          addInboxItem(title, `נדחה למחר (${mins || 25} דקות)`);
          clearAttemptedTask();
        }}
        onSaveToInbox={(title) => {
          addInboxItem(title, 'נשמר בעקבות חוק ה-3');
          clearAttemptedTask();
        }}
      />

      {/* Guided Evening Ritual Modal */}
      <EveningRitualModal
        isOpen={isEveningRitualOpen}
        onClose={() => {
          setIsEveningRitualOpen(false);
          if (activeScreen === 'ritual') {
            setActiveScreen('home');
          }
        }}
        todayTasks={todayTasks}
        inboxItems={inbox}
        availableMicroTasks={microTasks}
        onToggleCompleteTodayTask={toggleCompleteTodayTask}
        onPostponeTaskToTomorrow={handlePostponeTaskToTomorrow}
        onSendTaskToInbox={moveTaskToInbox}
        onDeleteTask={deleteTodayTask}
        onApplyTomorrowBig3={applyTomorrowBig3}
        onOpenDecomposeForInboxItem={handleSelectInboxForDecomposition}
      />

      {/* App / APK Install Modal with Direct Standalone Link and QR Code */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Bottom Navigation with Floating Action Button (shown when not on home or everywhere for fluid navigation) */}
      {activeScreen !== 'home' && (
        <BottomNav
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          inboxCount={inbox.filter((i) => !i.decomposed).length}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <MainApp />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
