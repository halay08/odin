import moment from 'moment';


/**
 * @param date
 * @returns 2020-06-01
 */
export function parseDateForNoteFeed(date: string | Date | undefined) {
  if(date && moment(date).isValid()) {
    return moment(date).format('DD MMMM YYYY');
  }
}

/**
 * @param date
 * @returns 2020-06-01
 */
export function parseDateToLocalFormat(date: string | Date | undefined) {
  if(date && moment(date).isValid()) {
    return moment(date).format('DD/MM/YYYY');
  }
}

/**
 * @param date
 * @returns "Sunday, February 14th 2010, 3:25:50 pm"
 */
export function parseDateAndTimeLocal(date: string | Date | undefined) {
  if(date && moment(date).isValid()) {
    return moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
  }
}

/**
 * @param date
 * @returns "04/09/1986 8:30:00 PM"
 */
export function parseDateLocalizedHoursAndSeconds(date: string | Date | undefined) {
  if(date && moment(date).isValid()) {
    return moment(date).format('DD/MM/YYYY LTS');
  }
}

/**
 * @param date
 * @returns "04/09/1986 8:30:00 PM"
 */
export function parseDateLocalizedHours(date: string | Date | undefined) {
  if(date && moment(date).isValid()) {
    return moment(date).format('DD/MM/YYYY LT');
  }
}
