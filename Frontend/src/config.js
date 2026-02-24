const BASE_URL = import.meta.env.VITE_API_URL;

export default BASE_URL;
console.log("BASE", BASE_URL);
console.log("This is import", import.meta.env.DEV, import.meta.env.production);
console.log(import.meta.env);
console.log(import.meta.env.VITE_API_URL);
