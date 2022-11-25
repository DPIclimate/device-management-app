import React from "react";

export const ManageDeviceContext=React.createContext<any>(null)

export const ManageDeviceContextProvider=({children, reducer, device_comm_data})=>{

    return(
        <ManageDeviceContext.Provider value={{reducer, device_comm_data}}>
            {children}
        </ManageDeviceContext.Provider>
    )
}