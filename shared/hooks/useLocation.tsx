import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

export interface LocationResponse {
    location_status: Location.PermissionStatus;
    location: Location.LocationObject;
    isLoading: boolean;
    error: string;
    retry():void
}
export const useLocation = (): LocationResponse => {
    //Custom hook to get the users location

    const [isLoading, setLoading] = useState<boolean>(true);
    const [location, setLocation] = useState<Location.LocationObject>(null);
    const [location_status, set_location_status] = useState<Location.PermissionStatus>(null);
    const [error, setError] = useState<string>(null);
    const [refetch, setRefetch]=useState<boolean>(false)
    
    const retry = (): void => {
        setLoading(true);
        setLocation(null);
        set_location_status(null)
        setRefetch((prev) => !prev);
    };

    useEffect(() => {
        
        let mounted=true 

        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status != Location.PermissionStatus.GRANTED) {
                if (mounted){
                    setError("Location failed");
                }
                return;
            }
            try {
                const user_location = await Location.getCurrentPositionAsync({});
                if (mounted){
                    setLocation(user_location);
                }
            } catch (error) {
                if (mounted){
                    setError(error);
                }
            }
            if (mounted){
                set_location_status(status);
                setLoading(false);
            }
        };
        getLocation();

        return () => {
            mounted=false
        }
    }, [refetch]);

    return { location_status, location, isLoading, error, retry };
};
