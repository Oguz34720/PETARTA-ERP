export const API = window.location.hostname.includes('onrender.com')
  ? 'https://petarta-erp-backend.onrender.com' // Edit this with your actual Render backend URL
  : window.location.hostname.includes('loca.lt')
  ? 'https://hip-cooks-pick.loca.lt'
  : 'http://localhost:3001';
