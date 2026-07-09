let swRegistration: ServiceWorkerRegistration | null = null;

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      return swRegistration;
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  
  return permission;
};

export const hasNotificationPermission = (): boolean => {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
};

export const showNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
  }
): Notification | null => {
  if (!hasNotificationPermission()) {
    return null;
  }

  try {
    if (swRegistration) {
      swRegistration.active?.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body: options?.body,
        tag: options?.tag,
      });
    }
    
    return new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/icon-192.png',
      tag: options?.tag,
      data: options?.data,
      requireInteraction: options?.requireInteraction || false,
    });
  } catch (error) {
    console.error('通知发送失败:', error);
    return null;
  }
};

export const showBudgetAlert = (totalExpense: number, budget: number): void => {
  const usedPercent = (totalExpense / budget) * 100;
  showNotification('预算提醒', {
    body: `本月支出已达 ¥${totalExpense.toFixed(2)}，超出预算 ${usedPercent.toFixed(0)}%`,
    tag: 'budget-alert',
    requireInteraction: true,
  });
};

export const showDailyReminder = (): void => {
  showNotification('记账提醒', {
    body: '今天还没有记账哦，记得记录今天的收支情况！',
    tag: 'daily-reminder',
  });
};

export const showImportComplete = (success: number, failed: number): void => {
  let body = `成功导入 ${success} 条账单`;
  if (failed > 0) {
    body += `，${failed} 条导入失败`;
  }
  showNotification('导入完成', {
    body,
    tag: 'import-complete',
  });
};

export const showAIResult = (count: number): void => {
  showNotification('AI 分类完成', {
    body: `AI 已智能分类 ${count} 条记录，等待您确认`,
    tag: 'ai-result',
  });
};

export const scheduleDailyReminder = (hour: number = 20): void => {
  if (!hasNotificationPermission()) {
    return;
  }

  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hour, 0, 0, 0);

  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const delay = reminderTime.getTime() - now.getTime();

  setTimeout(() => {
    showDailyReminder();
    scheduleDailyReminder(hour);
  }, delay);

  if (swRegistration?.active) {
    swRegistration.active.postMessage({
      type: 'SET_REMINDER',
      hour,
    });
  }
};

export const checkBudgetAndNotify = (totalExpense: number, budget: number, threshold: number = 80): boolean => {
  if (!hasNotificationPermission()) {
    return false;
  }

  const usedPercent = (totalExpense / budget) * 100;
  if (usedPercent >= threshold && budget > 0) {
    showBudgetAlert(totalExpense, budget);
    return true;
  }
  return false;
};

export const isServiceWorkerRegistered = (): boolean => {
  return swRegistration !== null;
};
