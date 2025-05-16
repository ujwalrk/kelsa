import { create } from 'zustand';

interface Card {
  id: string;
  content: string;
  list_id: string;
  position: number;
}

interface List {
  id: string;
  name: string;
  board_id: string;
  position: number;
}

interface Board {
  id: string;
  name: string;
}

interface BoardState {
  board: Board | null;
  lists: List[];
  cards: Card[];
  setBoard: (board: Board) => void;
  setLists: (lists: List[]) => void;
  setCards: (cards: Card[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  lists: [],
  cards: [],
  setBoard: (board: Board) => set({ board }),
  setLists: (lists: List[]) => set({ lists }),
  setCards: (cards: Card[]) => set({ cards }),
}));
