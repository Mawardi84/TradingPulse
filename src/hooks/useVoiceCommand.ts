import { useState, useEffect, useCallback } from 'react';

export const useVoiceCommand = (onCommand: (cmd: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; // Support Indonesian
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      // Map natural language to terminal commands
      let mappedCmd = transcript;
      
      if (transcript.includes('chart') || transcript.includes('grafik')) {
        const parts = transcript.split(' ');
        const asset = parts[parts.length - 1].toUpperCase();
        mappedCmd = `/chart ${asset}`;
      } else if (transcript.includes('portfolio') || transcript.includes('akun')) {
        mappedCmd = '/portfolio';
      } else if (transcript.includes('berita') || transcript.includes('news')) {
        mappedCmd = '/news';
      } else if (transcript.includes('sistem') || transcript.includes('system')) {
        mappedCmd = '/system';
      } else if (transcript.includes('bot')) {
        mappedCmd = '/bot';
      } else if (transcript.includes('roadmap') || transcript.includes('rencana')) {
        mappedCmd = '/roadmap';
      } else if (transcript.includes('rsi') || transcript.includes('indeks kekuatan relatif')) {
        mappedCmd = '/rsi on';
      } else if (transcript.includes('macd')) {
        mappedCmd = '/macd on';
      } else if (transcript.includes('bersihkan') || transcript.includes('clear')) {
        mappedCmd = '/indicators off';
      } else if (transcript.includes('quant') || transcript.includes('skrip')) {
        mappedCmd = '/quant';
      }

      onCommand(mappedCmd);
    };

    recognition.start();
  }, [onCommand]);

  return { isListening, startListening, error };
};
