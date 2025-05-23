
import React from 'react';

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className || "w-5 h-5 mr-2"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6c0 1.031-.255 2.001-.704 2.857A8.254 8.254 0 0012 21a8.25 8.25 0 002.962-5.543c-1.437 1.162-3.336 1.773-5.404 1.773-2.068 0-3.967-.611-5.404-1.773A8.254 8.254 0 0012 21a8.25 8.25 0 003.708-10.034c.388-1.36.219-2.805-.484-3.952zM12 12.75a.75.75 0 00.75-.75V6.75a.75.75 0 00-1.5 0v5.25a.75.75 0 00.75.75z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" fill="currentColor" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M8.26 9.032a3.751 3.751 0 005.482 5.482 3.75 3.75 0 00-5.482-5.482z" />
  </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export const CalendarDaysIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 12.75h.008v.008H12v-.008zM12 10.5h.008v.008H12v-.008zM9.75 15h.008v.008H9.75v-.008zM9.75 12.75h.008v.008H9.75v-.008zM9.75 10.5h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5v-.008zM7.5 12.75h.008v.008H7.5v-.008zM7.5 10.5h.008v.008H7.5v-.008zM14.25 15h.008v.008h-.008v-.008zm0-2.25h.008v.008h-.008v-.008zm0-2.25h.008v.008h-.008v-.008zm2.25 4.5h.008v.008h-.008V15zm0-2.25h.008v.008h-.008v-.008zm0-2.25h.008v.008h-.008v-.008z" />
  </svg>
);

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9H11.25A3.375 3.375 0 007.5 12.375v4.5m9 0H7.5m9-12.75H7.5A2.25 2.25 0 005.25 6v3A2.25 2.25 0 007.5 11.25h9A2.25 2.25 0 0018.75 9V6A2.25 2.25 0 0016.5 6z" />
  </svg>
);

export const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.64M18 18.72v-2.28m0 2.28c-.53 0-1.04-.208-1.412-.586M18 18.72M18 18.72M12 11.25a3 3 0 100-6 3 3 0 000 6M12 11.25v-2.25m0 2.25c-.53 0-1.04-.208-1.412-.586M12 11.25M12 11.25M3 18.72a9.094 9.094 0 013.741-.479 3 3 0 01-3.741-5.64M3 18.72v-2.28m0 2.28c.53 0 1.04-.208 1.412-.586M3 18.72M3 18.72M9 11.25a3 3 0 100-6 3 3 0 000 6M9 11.25v-2.25m0 2.25c-.53 0-1.04-.208-1.412-.586M9 11.25M9 11.25M15 11.25a3 3 0 100-6 3 3 0 000 6M15 11.25v-2.25m0 2.25c-.53 0-1.04-.208-1.412-.586M15 11.25M15 11.25M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);
