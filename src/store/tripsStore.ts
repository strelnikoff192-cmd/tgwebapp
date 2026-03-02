import { create } from 'zustand';

export interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  tariff: string;
  distanceKm: number;
  status: 'completed' | 'cancelled';
}

interface TripsState {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id'>) => void;
}

const LS_KEY = 'globus_trips';

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveTrips(trips: Trip[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(trips));
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: loadTrips(),
  addTrip: (trip) => {
    const newTrip: Trip = { ...trip, id: Date.now().toString() };
    const updated = [newTrip, ...get().trips];
    saveTrips(updated);
    set({ trips: updated });
  },
}));
