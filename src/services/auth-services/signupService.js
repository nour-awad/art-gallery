import axios from "axios";

export const signupService = async (email, password, firstName, lastName) =>
  await axios.post("/api/user/register", {
    email,
    password,
    name: `${firstName} ${lastName}`,
    gender: "Not Specified", // Adding a default gender since it's required by the backend
  });
