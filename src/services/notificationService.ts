
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.error("This browser does not support desktop notification");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string, type: 'ORDER' | 'STOCK' | 'ALERT' = 'ALERT') => {
    if (Notification.permission !== 'granted') return;

    // Define Icons based on type (using emojis or generic icons if external URLs fail)
    // In a real PWA, these would be local assets
    const icon = type === 'ORDER' ? 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' : 
                 type === 'STOCK' ? 'https://cdn-icons-png.flaticon.com/512/3082/3082031.png' : 
                 'https://cdn-icons-png.flaticon.com/512/564/564619.png';

    const notification = new Notification(title, {
        body,
        icon,
        tag: type, // Prevents duplicate stacking of same type if needed, or use ID
        requireInteraction: type === 'ORDER', // Orders stay on screen until clicked
        silent: false
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    // Play Sound
    playAlertSound(type);
};

const playAlertSound = (type: 'ORDER' | 'STOCK' | 'ALERT') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + delay);
        
        gain.gain.setValueAtTime(0.1, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + delay + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);
    };

    if (type === 'ORDER') {
        // "Ding Dong" sound
        playTone(660, 'sine', 0.6, 0);
        playTone(550, 'sine', 0.8, 0.2);
    } else if (type === 'STOCK') {
        // Low Warning Beep
        playTone(300, 'sawtooth', 0.3, 0);
        playTone(300, 'sawtooth', 0.3, 0.4);
    } else {
        // Generic Alert
        playTone(440, 'square', 0.2, 0);
    }
};
