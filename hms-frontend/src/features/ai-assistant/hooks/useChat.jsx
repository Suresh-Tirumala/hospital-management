import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { chatAPI } from '../../../services/chat-api';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  hasMore: false,
  page: 0
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SENDING':
      return { ...state, isSending: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload || [] };
    case 'ADD_SESSION':
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload, messages: [], page: 0, hasMore: false };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload || [] };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, idx) =>
          idx === action.payload.index ? action.payload.message : msg
        )
      };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortControllerRef = useRef(null);

  // --- Actions ---

  const loadSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await chatAPI.getUserSessions(0, 20);
      if (response.data?.data?.content) {
        dispatch({ type: 'SET_SESSIONS', payload: response.data.data.content });
      } else {
        dispatch({ type: 'SET_SESSIONS', payload: [] });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      dispatch({ type: 'SET_SESSIONS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadChatHistory = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await chatAPI.getChatHistory(sessionId, 0, 50);
      if (response.data?.data) {
        const { session, messages, hasMore } = response.data.data;
        dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
        dispatch({ type: 'SET_MESSAGES', payload: (messages || []).slice().reverse() });
        dispatch({ type: 'SET_HAS_MORE', payload: hasMore || false });
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createSession = useCallback(async (sessionType = 'GENERAL', title = 'New Chat') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await chatAPI.createSession(sessionType, title);
      if (response.data?.data) {
        dispatch({ type: 'ADD_SESSION', payload: response.data.data });
        dispatch({ type: 'SET_CURRENT_SESSION', payload: response.data.data });
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create new session');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    return null;
  }, []);

  const selectSession = useCallback(async (session) => {
    if (!session?.sessionId) return;
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    await loadChatHistory(session.sessionId);
  }, [loadChatHistory]);

  const sendMessage = useCallback(async (content, options = {}) => {
    if (!content?.trim()) return;
    
    let session = state.currentSession;
    if (!session) {
      session = await createSession();
      if (!session) return;
    }

    const userMessage = {
      id: Date.now(),
      senderType: 'USER',
      content,
      messageType: 'TEXT',
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_SENDING', payload: true });

    const assistantMessage = {
      id: Date.now() + 1,
      senderType: 'ASSISTANT',
      content: '',
      messageType: 'TEXT',
      isStreaming: true,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });

    try {
      abortControllerRef.current = new AbortController();
      const response = await chatAPI.sendMessage(
        session.sessionId,
        content,
        options.context,
        options.includeRehabilitation
      );

      if (response.data?.data) {
        const messageIndex = state.messages.length + 1;
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            index: messageIndex,
            message: { ...response.data.data, isStreaming: false }
          }
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.success('Message generation stopped');
      } else {
        console.error('Failed to send message:', error);
        toast.error('Failed to get response');
        const errorIndex = state.messages.length;
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            index: errorIndex,
            message: {
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false,
              id: Date.now() + 2
            }
          }
        });
      }
    } finally {
      dispatch({ type: 'SET_SENDING', payload: false });
      abortControllerRef.current = null;
    }
  }, [state.currentSession, state.messages.length, createSession]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const endSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      await chatAPI.endSession(sessionId);
      if (state.currentSession?.sessionId === sessionId) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      }
      await loadSessions();
      toast.success('Session ended');
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end session');
    }
  }, [state.currentSession, loadSessions]);

  const deleteSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try {
      await chatAPI.deleteSession(sessionId);
      if (state.currentSession?.sessionId === sessionId) {
        dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
      }
      await loadSessions();
      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  }, [state.currentSession, loadSessions]);

  const clearCurrentSession = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: null });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
    dispatch({ type: 'SET_HAS_MORE', payload: false });
    dispatch({ type: 'SET_PAGE', payload: 0 });
  }, []);

  // --- Effects ---

  useEffect(() => {
    loadSessions();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadSessions]);

  const value = {
    ...state,
    loadSessions,
    loadChatHistory,
    createSession,
    sendMessage,
    stopGeneration,
    endSession,
    deleteSession,
    selectSession,
    clearCurrentSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;