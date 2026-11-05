import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirebase } from './useFirebase';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { auth } from '../services/firebase';
import { Instrument } from '../types/market';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Don't throw for offline/network errors to prevent UI crashes during background sync
  if (message.toLowerCase().includes('offline') || message.toLowerCase().includes('network') || message.toLowerCase().includes('reach cloud firestore')) {
    console.warn('Silent Firestore warning (Offline):', message);
    return;
  }

  throw new Error(JSON.stringify(errInfo));
}

export interface Position {
  id: string;
  symbol: string;
  displaySymbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  openTime: any;
  pnl: number;
  pnlPercent: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  displaySymbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  openTime: any;
  closeTime: any;
}

export interface PortfolioStats {
  balance: number;
  equity: number;
  floatingPnL: number;
  marginUsed: number;
  freeMargin: number;
}

export const usePortfolio = (currentInstrument?: Instrument, allInstruments: Instrument[] = []) => {
  const { user } = useFirebase();
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<ClosedTrade[]>([]);
  const [balance, setBalance] = useState<number>(50000.0);
  const [isLoading, setIsLoading] = useState(true);

  // Load Balance & Profile
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.balance !== undefined) {
          setBalance(data.balance);
        } else {
          // Initialize balance if not exists
          updateDoc(userRef, { 
            balance: 50000.0,
            updatedAt: serverTimestamp()
          }).catch(err => {
            console.warn('Initial balance sync failed, trying setDoc merge');
            setDoc(userRef, { 
              balance: 50000.0, 
              updatedAt: serverTimestamp() 
            }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
          });
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => unsubscribe();
  }, [user]);

  // Load Active Positions
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/positions`;
    const q = query(
      collection(db, path),
      orderBy('openTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Position));
      setPositions(fetched);
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));

    return () => unsubscribe();
  }, [user]);

  // Load Trade History
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/history`;
    const q = query(
      collection(db, path),
      orderBy('closeTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClosedTrade));
      setHistory(fetched);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));

    return () => unsubscribe();
  }, [user]);

  // Derive position live PnL based on market prices
  const syncedPositions = useMemo(() => {
    if (positions.length === 0) return [];

    return positions.map((p) => {
      const match =
        allInstruments.find((i) => i.symbol === p.symbol) ||
        (currentInstrument && currentInstrument.symbol === p.symbol ? currentInstrument : null);

      if (!match) return p;

      const currentPrice = match.price;
      const priceDiff = p.type === 'BUY' ? currentPrice - p.openPrice : p.openPrice - currentPrice;

      // Calculate multiplier based on asset class
      let multiplier = 1;
      if (p.symbol.includes('XAU')) multiplier = 100;
      else if (p.symbol.includes('JPY')) multiplier = 1000;
      else if (p.symbol.includes('USDT')) multiplier = 1;
      else if (p.symbol.length === 6) multiplier = 100000; // Forex pairs

      const pnl = Number((priceDiff * p.lots * (multiplier > 1000 ? 1000 : multiplier)).toFixed(2));
      const pnlPercent = Number(((priceDiff / p.openPrice) * 100).toFixed(2));

      return {
        ...p,
        currentPrice,
        pnl,
        pnlPercent,
      };
    });
  }, [positions, currentInstrument, allInstruments]);

  const openPosition = useCallback(async (
    symbol: string, 
    displaySymbol: string, 
    type: 'BUY' | 'SELL', 
    lots: number, 
    price: number,
    sl: number,
    tp: number
  ) => {
    if (!user) return;

    const path = `users/${user.uid}/positions`;
    try {
      const newPosRef = doc(collection(db, path));
      await setDoc(newPosRef, {
        userId: user.uid,
        symbol,
        displaySymbol,
        type,
        lots,
        openPrice: price,
        currentPrice: price,
        sl,
        tp,
        status: 'OPEN',
        openTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        pnl: 0,
        pnlPercent: 0
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  }, [user]);

  const closePosition = useCallback(async (position: Position) => {
    if (!user) return;

    const historyPath = `users/${user.uid}/history`;
    const posPath = `users/${user.uid}/positions/${position.id}`;
    const userPath = `users/${user.uid}`;

    try {
      // 1. Move to history
      const historyRef = doc(collection(db, historyPath));
      await setDoc(historyRef, {
        userId: user.uid,
        symbol: position.symbol,
        displaySymbol: position.displaySymbol,
        type: position.type,
        lots: position.lots,
        openPrice: position.openPrice,
        closePrice: position.currentPrice,
        sl: position.sl,
        tp: position.tp,
        status: 'CLOSED',
        openTime: position.openTime,
        closeTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        pnl: position.pnl,
        pnlPercent: position.pnlPercent
      });

      // 2. Update balance
      const userRef = doc(db, userPath);
      const newBalance = balance + position.pnl;
      await updateDoc(userRef, { 
        balance: newBalance,
        updatedAt: serverTimestamp() 
      });

      // 3. Remove from active positions
      await deleteDoc(doc(db, posPath));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `closePosition_${position.id}`);
    }
  }, [user, balance]);

  const closeAllPositions = useCallback(async () => {
    if (!user) return;
    for (const pos of syncedPositions) {
      await closePosition(pos);
    }
  }, [user, syncedPositions, closePosition]);

  const stats: PortfolioStats = {
    balance,
    floatingPnL: syncedPositions.reduce((acc, p) => acc + (p.pnl || 0), 0),
    equity: balance + syncedPositions.reduce((acc, p) => acc + (p.pnl || 0), 0),
    marginUsed: syncedPositions.reduce((acc, p) => acc + p.lots * 1000, 0),
    freeMargin: (balance + syncedPositions.reduce((acc, p) => acc + (p.pnl || 0), 0)) - syncedPositions.reduce((acc, p) => acc + p.lots * 1000, 0)
  };

  return {
    positions: syncedPositions,
    history,
    stats,
    isLoading,
    openPosition,
    closePosition,
    closeAllPositions
  };
};
