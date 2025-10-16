import React, { createContext, useContext, useState, ReactNode } from "react";

type Listing = {
  id: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  images: string[];
};

type ListingsContextType = {
  listings: Listing[];
  addListing: (listing: Omit<Listing, "id">) => void;
  removeListing: (id: string) => void;
};

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [listings, setListings] = useState<Listing[]>([]);

  const addListing = (listing: Omit<Listing, "id">) => {
    const safeListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      images: listing.images && listing.images.length > 0 ? listing.images : [
        "https://images.unsplash.com/photo-1560185127-6ed189bf04eb?auto=format&fit=crop&w=1200&q=80"
      ],
    };
    setListings((prev) => [safeListing, ...prev]);
  };

  const removeListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, removeListing }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListingsContext = () => {
  const context = useContext(ListingsContext);
  if (!context) throw new Error("useListingsContext must be used inside a ListingsProvider");
  return context;
};
