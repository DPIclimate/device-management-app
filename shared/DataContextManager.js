import React, { useContext } from "react";

export const DataContext = React.createContext()

export const DataContextProvider = ({value, children}) =>{
    return(
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )
}

export function useDataContext(){
    return useContext(DataContext)
}