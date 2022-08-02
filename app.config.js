import 'dotenv/config';

export default({config}) =>{
    config.android.config.googleMaps.apiKey=process.env.GOOGLE_MAPS_API_KEY
    return config
}