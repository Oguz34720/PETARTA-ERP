export const API = window.location.hostname.includes('onrender.com')
  ? 'https://petarta-erp.onrender.com'
  : window.location.hostname.includes('loca.lt')
  ? 'https://hip-cooks-pick.loca.lt'
  : 'http://localhost:3001';
