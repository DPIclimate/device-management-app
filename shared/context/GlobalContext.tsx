import React, { useEffect, useReducer } from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { GlobalState, Reducer_Actions } from "../types/CustomTypes";


export const GlobalContext=React.createContext<any>(null)

export const GlobalContextProvider=({children, reducer})=>{

    const [state, dispatch] = reducer
    const {network_status, network_status_loading, network_error}=useNetworkStatus()
    
    useEffect(() =>{
        dispatch({type:Reducer_Actions.SET_NETWORK_STATUS, payload:network_status})
        console.log("Network status update", network_status)
    },[network_status])

    return(
        <GlobalContext.Provider value={reducer}>
            {children}
        </GlobalContext.Provider>
    )
}