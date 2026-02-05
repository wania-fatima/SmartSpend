import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { budgetAPI, expenseAPI } from '../utils/api';
import { useCurrency } from '../utils/currency';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { format } = useCurrency();

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Check for various app events and show notifications
  useEffect(() => {
    if (!user) return;

    const checkForNotifications = () => {
      // Welcome notification for new users
      const hasSeenWelcome = localStorage.getItem(`welcome-seen-${user._id}`);
      if (!hasSeenWelcome) {
        setTimeout(() => {
          addNotification(
            `Welcome back, ${user.name}! Ready to manage your finances?`,
            'success'
          );
          localStorage.setItem(`welcome-seen-${user._id}`, 'true');
        }, 1000);
      }

      // Check for goals that are close to completion
      // This would typically come from an API call, but for demo purposes:
      setTimeout(() => {
        addNotification(
          '💡 Tip: Track your expenses daily to stay within budget!',
          'info'
        );
      }, 3000);

      // Check for actual budget alerts
      const checkBudgetAlerts = async () => {
        try {
          // First check if user has any expenses
          const expenses = await expenseAPI.getRecentExpenses();
          
          // Only check for budget alerts if user has expenses
          if (expenses && expenses.length > 0) {
            const alerts = await budgetAPI.getBudgetAlerts();
            if (alerts.length > 0) {
              // Show alerts for budgets that are exceeded or close to limit
              alerts.forEach(alert => {
                if (alert.status === 'exceeded') {
                  addNotification(
                    `⚠️ Budget exceeded for ${alert.category}: ${format(alert.spent)} spent of ${format(alert.allocated)}`,
                    'warning'
                  );
                } else if (alert.status === 'warning') {
                  addNotification(
                    `⚠️ ${alert.category} budget at ${alert.percentage}%: ${format(alert.remaining)} remaining`,
                    'warning'
                  );
                }
              });
            }
          }
        } catch (error) {
          console.error('Error checking budget alerts:', error);
        }
      };

      setTimeout(checkBudgetAlerts, 5000);
    };

    checkForNotifications();
  }, [user]);

  // Expose addNotification globally for use in components
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };