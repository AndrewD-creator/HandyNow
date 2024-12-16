//(Inspired by React Context)
import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data, including fullname
  const [selectedHandyman, setSelectedHandyman] = useState(null); // Selected handyman details


  return (
    <UserContext.Provider value={{ user, setUser, selectedHandyman, setSelectedHandyman }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

//References:
// • React Context (2024), Available at:: https://react.dev/reference/react/useContext
