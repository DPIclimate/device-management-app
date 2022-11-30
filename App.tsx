import React, { useEffect, useState, useCallback, useReducer } from "react";
import ScreenNavigator from "./routes/ScreenNavigator";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalContextProvider } from "./shared/context/GlobalContext";
import { GlobalState, GlobalState_Actions, Regions, Store_Tokens } from "./shared/types/CustomTypes";
import { validateToken } from "./shared/functions/InterfaceTTN";

SplashScreen.preventAutoHideAsync();

export default function App() {
    //Used for deep linking
    // exp://10.221.26.87:19000/--/device/?appid=oai-test-devices&uid=2SBBWH&link=true
    // dma://device/?appid=oai-test-devices&uid=A4RF3C&link=true
    const initialState: GlobalState = {
        ttn_auth_token: null,
        ttn_allowed_chars: new RegExp("^[a-z0-9](?:[-]?[a-z0-9]){2,}$"),
        application_server: Regions.EU1,
        communication_server: Regions.EU1,
        network_status: false,
    };

    const reducer = (state, action) => {
        switch (action.type) {
            case GlobalState_Actions.SET_AUTH_TOKEN:
                return {
                    ...state,
                    ttn_auth_token: action.payload,
                };
            case GlobalState_Actions.SET_TOKEN_VALID:
                return {
                    ...state,
                    ttn_isValid_token: action.payload,
                };
            case GlobalState_Actions.SET_APPLICATION_SERVER:
                if (!action.payload) return state; //If null, maintain default values from initial state

                return {
                    ...state,
                    application_server: action.payload,
                };
            case GlobalState_Actions.SET_COMMUNICATION_SERVER:
                if (!action.payload) return state;

                return {
                    ...state,
                    communication_server: action.payload,
                };
            case GlobalState_Actions.SET_NETWORK_STATUS:
                return {
                    ...state,
                    network_status: action.payload,
                };
            default:
                return state;
        }
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const prefix = Linking.createURL("/");
    const [data, setData] = useState(null);
    const [appIsReady, setAppIsReady] = useState(false);

    const linking = {
        prefixes: [prefix],
        config: {
            screens: {
                HomeScreen: "device",
            },
        },
    };
    useEffect(() => {
        async function getInitialURL() {
            const initialURL = await Linking.getInitialURL();
            console.log("init", initialURL);
            if (initialURL) setData(Linking.parse(initialURL));
        }

        async function prepare() {
            //Prepare user settings
            try {
                await loadUserSettings();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        const listener = Linking.addEventListener("url", handleDeepLink);

        if (!data) {
            getInitialURL();
        }

        prepare();

        return () => {
            listener.remove();
        };
    }, []);

    useEffect(() => {
        async function checkAppReady() {
            if (appIsReady) {
                console.log("app is ready");
                await SplashScreen.hideAsync();
            }
        }
        checkAppReady();
    }, [appIsReady]);

    const handleDeepLink = (event) => {
        let data = Linking.parse(event.url);
        setData(data);
    };

    const loadUserSettings = async () => {
        try {
            const server = await AsyncStorage.getItem(Store_Tokens.APPLICATION_SERVER);
            dispatch({ type: GlobalState_Actions.SET_APPLICATION_SERVER, payload: server });
        } catch (error) {
            console.log(error);
        }

        try {
            const server = await AsyncStorage.getItem(Store_Tokens.COMMUNICATION_SERVER);
            dispatch({ type: GlobalState_Actions.SET_COMMUNICATION_SERVER, payload: server });
        } catch (error) {
            console.log(error);
        }
        try {
            const authToken = await AsyncStorage.getItem(Store_Tokens.AUTH_TOKEN);
            dispatch({ type: GlobalState_Actions.SET_AUTH_TOKEN, payload: authToken });

        } catch (error) {
            console.log(error);
        }
    };

    if (!appIsReady) {
        return null;
    }

    return (
        <GlobalContextProvider reducer={[state, dispatch]}>
            <ScreenNavigator linking={linking} />
        </GlobalContextProvider>
    );
}
