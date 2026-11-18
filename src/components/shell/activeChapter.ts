import { createContext, useContext } from 'react';
import type { ChapterId } from '../../content/deadlocks';

/** The chapter that is now in the middle of the viewport. */
export const ActiveChapterContext = createContext<ChapterId>('concept');

export function useIsActiveChapter(id: ChapterId): boolean {
  return useContext(ActiveChapterContext) === id;
}
