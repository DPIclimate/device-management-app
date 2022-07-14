
global.DEV_STORE = 'devices'
global.APP_FAV = 'appFavs'
global.DEV_FAV = 'devFavs'
global.AUTH_TOKEN_STOR = 'authToken'
global.valid_token = false
global.TTN_TOKEN = undefined
global.headers = {
    "Authorization":global.TTN_TOKEN,
    "Content-Type": "application/json"
}

global.BASE_URL='https://eu1.cloud.thethings.network/api/v3'
global.ALLOWED_CHARS = new RegExp('^[a-z0-9](?:[-]?[a-z0-9]){2,}$')
