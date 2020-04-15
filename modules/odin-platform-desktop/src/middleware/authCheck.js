import moment from 'moment';

/**
 * Check the expiration of the token every time the user clicks in the UI. if the Token expires
 * in 10 min clear the token and that will trigger the action to logout the user.
 * @param store
 * @returns {function(*): function(*=): *}
 */
const authCheck = (store) => (next) => (action) => {
    let result = next(action);

    const tokenExpiresAt = localStorage.getItem(`tokenExpiresAt`);

    const isAfter = moment(moment().add(10, 'minutes').toISOString()).isAfter(tokenExpiresAt);

    if (isAfter || !tokenExpiresAt) {
        localStorage.removeItem(`token`);
        localStorage.removeItem(`tokenExpiresAt`);
    }
    return result
};

export default authCheck;
