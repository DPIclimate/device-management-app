import moment from 'moment';

/**
 * Formats a given time string into different formats.
 * @param {string} toFormat - The time string to be formatted.
 * @returns {Object} - An object containing formatted time values.
 * @example
 * // Returns:
 * // {
 * //   dayMonth: '01/01',
 * //   time: '12:00',
 * //   dayMonthYear: '01/01/2022'
 * // }
 * formatTime('2022-01-01T12:00:00');
 */
export const formatTime = (toFormat:string) =>{

    if (toFormat === undefined || toFormat === "") return 
    
    const dateUnix = new Date(toFormat);

    const dayMonth = moment(dateUnix).format('DD/MM')
    const time = moment(dateUnix).format('hh:mm')
    const dayMonthYear = moment(dateUnix).format('DD/MM/YYYY')

    return {
        dayMonth:dayMonth,
        time:time,
        dayMonthYear:dayMonthYear
    }
    
}