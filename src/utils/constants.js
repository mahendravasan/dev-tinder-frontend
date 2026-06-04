// export const BASE_URL = "http://localhost:1300";
// export const BASE_URL = "/api";
export const BASE_URL =
  location.hostname === "localhost" ? "http://localhost:1300" : "/api";
