import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      setTg(webApp);
      webApp.ready();
      webApp.expand();

      // Read Telegram user
      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }

      // Read startapp parameter
      if (webApp.initDataUnsafe?.start_param) {
        setStartParam(webApp.initDataUnsafe.start_param);
      } else {
        // Check window URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const sp = urlParams.get('startapp') || urlParams.get('tgWebAppStartParam');
        if (sp) setStartParam(sp);
      }
    }
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    try {
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // Ignore if not in mobile client
    }
  };

  const triggerNotification = (type: 'error' | 'success' | 'warning' = 'success') => {
    try {
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred(type);
      }
    } catch {}
  };

  const openInvoice = (invoiceUrl: string, callback?: (status: string) => void) => {
    if (tg?.openInvoice) {
      tg.openInvoice(invoiceUrl, callback);
    } else {
      window.open(invoiceUrl, '_blank');
    }
  };

  return {
    tg,
    user,
    startParam,
    triggerHaptic,
    triggerNotification,
    openInvoice,
    initData: tg?.initData || '',
  };
}
