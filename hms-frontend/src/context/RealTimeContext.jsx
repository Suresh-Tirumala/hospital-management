import { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

const RealTimeContext = createContext(null);

export const useRealTime = () => useContext(RealTimeContext);

export const RealTimeProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastAppointmentUpdate, setLastAppointmentUpdate] = useState(null);
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  useEffect(() => {
    // Check if we are in a browser environment
    if (typeof window === 'undefined') return;

    const client = new Client({
      brokerURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8081/api/'}ws-hms`.replace('http', 'ws'),
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api/'}ws-hms`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        setStompClient(client);

        // Subscribe to global appointments topic
        client.subscribe('/topic/appointments', (message) => {
          const appointment = JSON.parse(message.body);
          setLastAppointmentUpdate(appointment);
          toast.info(`Appointment Update: ${appointment.appointmentId} is now ${appointment.status}`, {
            icon: '📅',
            duration: 4000
          });
        });

        // Subscribe to stats update trigger
        client.subscribe('/topic/stats', () => {
          setStatsUpdateTrigger(prev => prev + 1);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (event) => {
        // Silently handle websocket errors (likely backend down)
        // console.error('Error with websocket', event);
      }
    });

    client.activate();

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  return (
    <RealTimeContext.Provider value={{ connected, lastAppointmentUpdate, statsUpdateTrigger }}>
      {children}
    </RealTimeContext.Provider>
  );
};
