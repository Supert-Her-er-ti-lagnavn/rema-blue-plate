import { useEffect, useRef, useState, useCallback } from 'react';

export type DirectionMsg = { 
  dx: number; 
  dy: number; 
  closestProductId?: string;
};

export type Status = "connecting" | "connected" | "disconnected" | "simulator_unavailable";

export function useDirectionWS(url: string) {
  const [status, setStatus] = useState<Status>("connecting");
  const [lastDirection, setLastDirection] = useState<DirectionMsg | null>(null);
  const [error, setError] = useState<string>();
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const simulatorTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<any[]>([]);
  const reconnectDelayRef = useRef(1000);
  const mountedRef = useRef(true);

  const flushQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift();
        wsRef.current.send(JSON.stringify(msg));
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    
    setStatus("connecting");
    setError(undefined);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log("WebSocket connected");
        
        // Send init message
        ws.send(JSON.stringify({ role: "client", msg_type: "init" }));
        
        setStatus("connected");
        reconnectDelayRef.current = 1000; // Reset backoff
        
        // Flush any queued messages
        flushQueue();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "direction") {
            // Clear simulator timeout - we got a response
            if (simulatorTimeoutRef.current) {
              clearTimeout(simulatorTimeoutRef.current);
              simulatorTimeoutRef.current = undefined;
            }
            
            // Update to connected if we were in simulator_unavailable
            if (status === "simulator_unavailable") {
              setStatus("connected");
            }
            
            setLastDirection({
              dx: data.dx,
              dy: data.dy,
              closestProductId: data.closestProductId
            });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("Connection error");
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log("WebSocket closed");
        setStatus("disconnected");
        
        // Auto-reconnect with exponential backoff
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * 2, 10000); // Cap at 10s
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError("Failed to connect");
      setStatus("disconnected");
    }
  }, [url, flushQueue, status]);

  const sendFetchClosest = useCallback(() => {
    const message = { role: "client", msg_type: "fetch_closest_product" };
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      
      // Start simulator timeout - if no direction in 1.5s, mark simulator unavailable
      if (simulatorTimeoutRef.current) {
        clearTimeout(simulatorTimeoutRef.current);
      }
      
      simulatorTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && status === "connected") {
          setStatus("simulator_unavailable");
        }
      }, 1500);
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
    }
  }, [status]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (simulatorTimeoutRef.current) {
        clearTimeout(simulatorTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    lastDirection,
    sendFetchClosest,
    error
  };
}
