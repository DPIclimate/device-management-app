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
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            set_location_status(status);

            if (status != Location.PermissionStatus.GRANTED) {
                setError("Location failed");
                return;
            }
            try {
                const user_location = await Location.getCurrentPositionAsync({});
                setLocation(user_location);
            } catch (error) {
                setError(error);
            }
        };
        setLoading(false);
        getLocation();
    }, [refetch]);

    return { location_status, location, isLoading, error, retry };
};
