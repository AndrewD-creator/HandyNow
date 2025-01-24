//(Inspired by React Context)
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data
  const [selectedHandyman, setSelectedHandyman] = useState(null); // Selected handyman details
  const [selectedBooking, setSelectedBooking] = useState(null); // Store selected booking details


  return (
    <UserContext.Provider value={{ user, setUser, selectedHandyman, setSelectedHandyman, selectedBooking,
      setSelectedBooking, }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

//References:
// • React Context (2024), Available at:: https://react.dev/reference/react/useContext
