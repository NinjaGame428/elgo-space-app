import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // This can be dynamic, e.g. based on the incoming request.
  const locale = 'en';
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});