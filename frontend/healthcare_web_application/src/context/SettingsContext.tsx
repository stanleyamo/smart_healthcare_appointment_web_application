import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface SettingsContextType {
    facilityName: string;
    updateFacilityName: (newName: string) => void;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [facilityName, setFacilityName] = useState("Smart Healthcare");

    const fetchSettings = async () => {
        try {
            const res = await api.get("settings/1/");
            setFacilityName(res.data.facility_name);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{
            facilityName,
            updateFacilityName: (name) => setFacilityName(name),
            refreshSettings: fetchSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within a SettingsProvider");
    return context;
};