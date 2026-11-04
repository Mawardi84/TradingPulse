import React, { useEffect, useRef } from 'react';

export interface TradingViewCalendarWidgetProps {
  importanceFilter?: string; // e.g., '1' for high, '0,1' for high/med, '-1,0,1' for all
}

export const TradingViewCalendarWidget: React.FC<TradingViewCalendarWidgetProps> = ({ importanceFilter = '-1,0,1' }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    container.current!.innerHTML = ''; // Clear previous widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '600',
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'id_ID',
      importanceFilter: importanceFilter,
    });
    container.current?.appendChild(script);
  }, [importanceFilter]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};
