import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingContent } from '@/types/trends';

// Define types for outline and timestamps
export interface PodcastOutline {
  intro?: string;
  topics?: string[];
  conclusion?: string;
  title?: string;
  sections?: Array<{
    title: string;
    points: string[];
  }>;
  [key: string]: string | string[] | Array<{title: string; points: string[]}> | undefined;
}

// Types
export interface PodcastScript {
  id?: string;
  title: string;
  topic: string;
  script: string;
  outline: PodcastOutline; // Replace any with a proper interface
  duration: number;
  memberCount: number;
  trends?: {
    news: TrendingContent[];
    discussions: TrendingContent[];
    relatedQueries: string[];
  };
  teamNotes?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  userId: string;
  teamId?: string;
}

export interface TeamNote {
  id?: string;
  scriptId: string;
  content: string;
  createdBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Team {
  id?: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[]; // Array of user IDs
  createdAt?: Timestamp | null;
}

// Script Operations
export const saveScript = async (scriptData: Omit<PodcastScript, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'scripts'), {
      ...scriptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error: unknown) {
    console.error('Error saving script:', error);
    throw error;
  }
};

export const updateScript = async (id: string, scriptData: Partial<PodcastScript>) => {
  try {
    const scriptRef = doc(db, 'scripts', id);
    await updateDoc(scriptRef, {
      ...scriptData,
      updatedAt: serverTimestamp()
    });
    return id;
  } catch (error: unknown) {
    console.error('Error updating script:', error);
    throw error;
  }
};

export const deleteScript = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'scripts', id));
    return id;
  } catch (error: unknown) {
    console.error('Error deleting script:', error);
    throw error;
  }
};

export const getScriptById = async (id: string): Promise<PodcastScript> => {
  try {
    const docSnap = await getDoc(doc(db, 'scripts', id));
    if (!docSnap.exists()) {
      throw new Error('Script not found');
    }
    return { id: docSnap.id, ...docSnap.data() } as PodcastScript;
  } catch (error: unknown) {
    console.error('Error getting script:', error);
    throw error;
  }
};

// Type for timestamp conversion
type TimestampValue = Timestamp | Date | number | null | undefined;

// Helper function to convert timestamps to milliseconds
const timestampToMillis = (timestamp: TimestampValue): number => {
  if (!timestamp) return 0;
  if (timestamp instanceof Timestamp && typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  return 0;
};

export const getUserScripts = async (userId: string): Promise<PodcastScript[]> => {
  try {
    // IMPORTANT: This query requires a Firestore composite index
    // If you're getting an index error, either:
    // 1. Create the index by clicking the link in the error message
    // 2. Or use the alternative query below that doesn't require an index
    
    // Option 1: With proper index (uncomment once index is created)
    /*
    const q = query(
      collection(db, 'scripts'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    */
    
    // Option 2: Without orderBy (doesn't require composite index)
    const q = query(
      collection(db, 'scripts'), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const scripts = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as PodcastScript[];
    
    // Client-side sorting by createdAt (descending)
    // This is a workaround until the Firestore index is created
    return scripts.sort((a: PodcastScript, b: PodcastScript) => {
      // Handle missing createdAt fields
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      
      // Convert Firestore timestamps to milliseconds using our helper
      const aTime = timestampToMillis(a.createdAt);
      const bTime = timestampToMillis(b.createdAt);
      
      return bTime - aTime; // Descending order (newest first)
    });
  } catch (error: unknown) {
    console.error('Error getting user scripts:', error);
    throw error;
  }
};

export const getTeamScripts = async (teamId: string): Promise<PodcastScript[]> => {
  try {
    // IMPORTANT: This query requires a Firestore composite index
    // If you're getting an index error, either:
    // 1. Create the index by clicking the link in the error message
    // 2. Or use the alternative query below that doesn't require an index
    
    // Option 1: With proper index (uncomment once index is created)
    /*
    const q = query(
      collection(db, 'scripts'), 
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc')
    );
    */
    
    // Option 2: Without orderBy (doesn't require composite index)
    const q = query(
      collection(db, 'scripts'), 
      where('teamId', '==', teamId)
    );
    
    const querySnapshot = await getDocs(q);
    const scripts = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as PodcastScript[];
    
    // Client-side sorting by createdAt (descending)
    // This is a workaround until the Firestore index is created
    return scripts.sort((a: PodcastScript, b: PodcastScript) => {
      // Handle missing createdAt fields
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      
      // Convert Firestore timestamps to milliseconds using our helper
      const aTime = timestampToMillis(a.createdAt);
      const bTime = timestampToMillis(b.createdAt);
      
      return bTime - aTime; // Descending order (newest first)
    });
  } catch (error: unknown) {
    console.error('Error getting team scripts:', error);
    throw error;
  }
};

// Team Notes Operations
export const saveTeamNote = async (noteData: Omit<TeamNote, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'teamNotes'), {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving team note:', error);
    throw error;
  }
};

export const updateTeamNote = async (id: string, noteData: Partial<TeamNote>) => {
  try {
    const noteRef = doc(db, 'teamNotes', id);
    await updateDoc(noteRef, {
      ...noteData,
      updatedAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    console.error('Error updating team note:', error);
    throw error;
  }
};

export const getScriptNotes = async (scriptId: string): Promise<TeamNote[]> => {
  try {
    const q = query(
      collection(db, 'teamNotes'), 
      where('scriptId', '==', scriptId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as TeamNote[];
  } catch (error) {
    console.error('Error getting script notes:', error);
    throw error;
  }
};

// Team Operations
export const createTeam = async (teamData: Omit<Team, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'teams'), {
      ...teamData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const updateTeam = async (id: string, teamData: Partial<Team>) => {
  try {
    const teamRef = doc(db, 'teams', id);
    await updateDoc(teamRef, teamData);
    return id;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

export const getUserTeams = async (userId: string): Promise<Team[]> => {
  try {
    // Get teams where user is the owner
    const ownerQuery = query(
      collection(db, 'teams'), 
      where('ownerId', '==', userId)
    );
    
    // Get teams where user is a member
    const memberQuery = query(
      collection(db, 'teams'), 
      where('members', 'array-contains', userId)
    );
    
    const [ownerSnapshot, memberSnapshot] = await Promise.all([
      getDocs(ownerQuery),
      getDocs(memberQuery)
    ]);
    
    // Combine results
    const ownerTeams = ownerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Team[];
    
    const memberTeams = memberSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Team[];
    
    // Remove duplicates
    const allTeams = [...ownerTeams];
    memberTeams.forEach(team => {
      if (!allTeams.some(t => t.id === team.id)) {
        allTeams.push(team);
      }
    });
    
    return allTeams;
  } catch (error) {
    console.error('Error getting user teams:', error);
    throw error;
  }
}; 