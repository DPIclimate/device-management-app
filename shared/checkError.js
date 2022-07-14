export const checkError = (response)=>{
    //Check for http error, return json response if none
    if (response.status >= 200 && response.status <= 299) {
      return response.json();
    } else {
      throw Error(`HTTP Error: ${response.status}`);
    }
}