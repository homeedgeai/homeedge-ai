import React, { createContext, useContext, useState, ReactNode } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  status: "new" | "contacted" | "closed";
};

type LeadsContextType = {
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
};

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>([]);

  const addLead = (lead: Omit<Lead, "id">) => {
    const newLead: Lead = { ...lead, id: Date.now().toString() };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStatus = (id: string, status: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
  };

  return (
    <LeadsContext.Provider value={{ leads, addLead, updateLeadStatus }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeadsContext = () => {
  const context = useContext(LeadsContext);
  if (!context) throw new Error("useLeadsContext must be used inside a LeadsProvider");
  return context;
};
