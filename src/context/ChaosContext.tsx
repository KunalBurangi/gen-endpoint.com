"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChaosContextType {
    chaosMode: boolean;
    toggleChaosMode: () => void;
}

const ChaosContext = createContext<ChaosContextType | undefined>(undefined);

export function ChaosProvider({ children }: { children: React.ReactNode }) {
    const [chaosMode, setChaosMode] = useState(false);

    // Load chaos mode state from cookie on mount
    useEffect(() => {
        const cookies = document.cookie.split(';');
        const chaosModeCookie = cookies.find(c => c.trim().startsWith('chaos-mode='));
        if (chaosModeCookie) {
            const value = chaosModeCookie.split('=')[1];
            setChaosMode(value === 'true');
        }
    }, []);

    const toggleChaosMode = () => {
        const newValue = !chaosMode;
        setChaosMode(newValue);

        // Set cookie with 1 year expiration
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `chaos-mode=${newValue}; expires=${expires.toUTCString()}; path=/`;
    };

    return (
        <ChaosContext.Provider value={{ chaosMode, toggleChaosMode }}>
            {children}
        </ChaosContext.Provider>
    );
}

export function useChaos() {
    const context = useContext(ChaosContext);
    if (context === undefined) {
        throw new Error('useChaos must be used within a ChaosProvider');
    }
    return context;
}
