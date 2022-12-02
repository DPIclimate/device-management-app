import React from "react";

export const ManageDeviceContext=React.createContext<any>(null)

export const ManageDeviceContextProvider=({children, device_comm_data, device_state, set_device_state})=>{

    return(
        <ManageDeviceContext.Provider value={{device_state, set_device_state, device_comm_data}}>
            {children}
        </ManageDeviceContext.Provider>
    )
}