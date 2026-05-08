export const isProd =
  location.hostname === 'kube.how' ||
  location.hostname === 'scheme.kube.how';

export const mainUrl   = () => isProd ? 'https://kube.how/'        : '/';
export const schemeUrl = () => isProd ? 'https://scheme.kube.how/' : '/scheme/';
