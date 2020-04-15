const logger = (store) => (next) => (action) => {
    let result = next(action);
    if (process.env.NODE_ENV === 'development') {
        console.group(action.type);
        console.info('dispatching', action);
        console.log('next state', store.getState());
        console.groupEnd();
    }
    return result
};

export default logger;
