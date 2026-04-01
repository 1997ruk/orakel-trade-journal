export type Direction = 'Buy' | 'Sell';
export type Resultat = 'Gain' | 'Perte';
export type Emotion = 'Confiance' | 'Peur' | 'Impatience' | 'Revenge trade' | 'Discipline';

export const SETUPS = ['OB', 'FVG', 'Breaker Block', 'Range', 'Liquidity Sweep', 'BOS', 'CHoCH', 'Supply/Demand'] as const;
export const ACTIFS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'USDJPY', 'NAS100', 'US30', 'SP500'] as const;
export const EMOTIONS: Emotion[] = ['Confiance', 'Peur', 'Impatience', 'Revenge trade', 'Discipline'];

export interface Trade {
  id: string;
  date: string;
  actif: string;
  setup: string;
  direction: Direction;
  prixEntree: number;
  stopLoss: number;
  takeProfit: number;
  risquePourcentage: number;
  taillePosition: number;
  resultat: Resultat;
  rMultiple: number;
  tradeRespecte: boolean;
  emotion: Emotion;
  noteAvant: string;
  noteApres: string;
  imageTrade?: string;
}

export interface TradeStats {
  totalTrades: number;
  tradesGagnants: number;
  tradesPerdants: number;
  winrate: number;
  profitTotalR: number;
  perteTotaleR: number;
  profitNetR: number;
  moyenneR: number;
  setupPlusRentable: string;
  setupMoinsRentable: string;
  actifPlusRentable: string;
  tauxDiscipline: number;
}
