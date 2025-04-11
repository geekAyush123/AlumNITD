declare module 'react-native-push-notification' {
    interface Notification {
      id?: string;
      title?: string;
      message?: string;
      userInteraction?: boolean;
      data?: Record<string, any>;
    }
  
    interface PushNotification {
      configure(options: {
        onNotification: (notification: Notification) => void;
        requestPermissions?: boolean;
        popInitialNotification?: boolean;
      }): void;
  
      localNotification(details: {
        id?: string;
        title: string;
        message: string;
        playSound?: boolean;
        soundName?: string;
        importance?: 'high' | 'max' | 'low' | 'min' | 'none';
        vibrate?: boolean;
        vibration?: number;
        priority?: 'high' | 'low' | 'max' | 'min' | 'default';
        channelId?: string;
      }): void;
  
      requestPermissions(): Promise<{ alert?: boolean; badge?: boolean; sound?: boolean }>;
      abandonPermissions(): void;
      getChannels(): Promise<{ channel_id: string }[]>;
      channelExists(channelId: string): Promise<boolean>;
      deleteChannel(channelId: string): void;
      getScheduledLocalNotifications(): Promise<Notification[]>;
      cancelLocalNotifications(details?: { id?: string }): void;
      cancelAllLocalNotifications(): void;
    }
  
    const PushNotification: PushNotification;
    export default PushNotification;
  }