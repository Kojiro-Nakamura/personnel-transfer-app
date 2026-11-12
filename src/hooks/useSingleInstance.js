import { useState, useEffect, useRef } from 'react';

const LOCK_NAME = 'jinjian_personnel_transfer_app_single_lock';
const CHANNEL_NAME = 'jinjian_personnel_transfer_app_channel';

/**
 * 二重起動防止用カスタムフック (Web Locks API + BroadcastChannel)
 * 
 * 1. 最初に開いたタブ（プライマリ）がロックを取得し通常起動。
 * 2. 2つ目以降に開いたタブ（セカンダリ）はロック取得に失敗し 'blocked' になる。
 * 3. プライマリタブが閉じられると、待機していたセカンダリタブにロックが渡り
 *    isPrimaryClosed = true となって「このタブで開始する」ボタンで安全に再開できる。
 */
export const useSingleInstance = () => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'granted' | 'blocked'
  const [isPrimaryClosed, setIsPrimaryClosed] = useState(false);
  const releaseLockRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

    if (typeof navigator !== 'undefined' && navigator.locks) {
      // Web Locks API を使用した確実な排他制御
      navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
        if (!lock) {
          // すでに別のタブが開いている場合
          if (!isMounted) return;
          setStatus('blocked');

          // 先行タブが閉じられるのをバックグラウンドで待機
          navigator.locks.request(LOCK_NAME, async (grantedLock) => {
            if (!isMounted) return;
            // 先行タブが閉じられたのでロックを取得完了
            setIsPrimaryClosed(true);

            // アンロードまたはアンマウントまでロックを維持
            await new Promise((resolve) => {
              releaseLockRef.current = resolve;
            });
          });
          return;
        }

        // ロック取得成功（最初のタブ）
        if (!isMounted) return;
        setStatus('granted');

        // タブが閉じられるまでロックを保持し続ける
        await new Promise((resolve) => {
          releaseLockRef.current = resolve;
        });
      });
    } else {
      // Web Locks API 非対応環境向けのフォールバック（BroadcastChannelベース）
      if (channel) {
        let isBlocked = false;
        channel.postMessage({ type: 'PING' });

        const timer = setTimeout(() => {
          if (!isMounted) return;
          if (!isBlocked) {
            setStatus('granted');
          }
        }, 150);

        channel.onmessage = (e) => {
          if (e.data?.type === 'PONG') {
            isBlocked = true;
            clearTimeout(timer);
            if (!isMounted) return;
            setStatus('blocked');
          } else if (e.data?.type === 'PING') {
            channel.postMessage({ type: 'PONG' });
          } else if (e.data?.type === 'PRIMARY_CLOSED') {
            if (!isMounted) return;
            setIsPrimaryClosed(true);
          }
        };
      } else {
        // いずれも非対応の場合はそのまま起動
        setStatus('granted');
      }
    }

    const handleBeforeUnload = () => {
      if (channel) {
        channel.postMessage({ type: 'PRIMARY_CLOSED' });
      }
      if (releaseLockRef.current) {
        releaseLockRef.current();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (releaseLockRef.current) {
        releaseLockRef.current();
      }
      if (channel) {
        channel.close();
      }
    };
  }, []);

  const claimInstance = () => {
    setStatus('granted');
    setIsPrimaryClosed(false);
  };

  return { status, isPrimaryClosed, claimInstance };
};
