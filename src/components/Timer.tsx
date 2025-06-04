'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVibrate } from '@/hooks/useVibrate';

const WORK_TIME = 20 * 60; // 20 minutes in seconds
const BREAK_TIME = 20; // 20 seconds

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const vibrate = useVibrate();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações desktop");
      return;
    }

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Permissão para notificações concedida!");
      }
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const showNotification = useCallback(() => {
    if (Notification.permission === "granted") {
      new Notification("Eye Friend", {
        body: "Hora de fazer uma pausa! Olhe para algo distante por 20 segundos.",
        icon: "/icon-192x192.svg",
        badge: "/icon-192x192.svg",
        tag: "eye-friend-notification"
      });
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    showNotification();
    vibrate([200]);
    setIsBreak(true);
    setTimeLeft(BREAK_TIME);
  }, [showNotification, vibrate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center">
        <h1 
          className="text-4xl font-bold mb-8 cursor-help inline-block" 
          title="A cada 20 minutos olhando para a tela, faça uma pausa de 20 segundos olhando para algo distante (cerca de 6 metros)."
        >
          Eye Friend
        </h1>
        <div className="text-8xl font-mono mb-8">{formatTime(timeLeft)}</div>
        
        {isBreak && (
          <div className="mb-8 p-4 bg-blue-600 rounded-lg">
            <p className="text-xl">Look at something 20 feet away for 20 seconds!</p>
          </div>
        )}

        <div className="space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
} 