export const getHostName = () => {
  let host: string | undefined = window.location.host;

  if(host.indexOf('localhost') === -1) {

    if(host.indexOf('mobile') > -1) {
      host = `https://${host.replace('mobile', 'api')}`;
    } else {
      host = `https://api.${host}`;
    }
  } else {
    host = process.env.REACT_APP_ODIN_API_URL
  }

  return host;
}
