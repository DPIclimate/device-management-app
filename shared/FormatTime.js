import moment from 'moment';

export const formatTime = (toFormat) =>{
    const dateUnix = new Date(toFormat);

    const dayMonth = moment(dateUnix).format('DD/MM')
    const time = moment(dateUnix).format('hh:mm')
    const dayMonthYear = moment(dateUnix).format('DD/MM/YYYY')

    return [dayMonth, time, dayMonthYear, dateUnix]
    
}