import 'dotenv/config';

export default({config}) =>{
    config.android.config.googleMaps.apiKey=process.env.GOOGLE_MAPS_API_KEY
    config.extra={
        "eas": {
            "projectId": "c886b8fd-607e-48c2-90a0-302f2e6dfd94"
        }}
    return config
}