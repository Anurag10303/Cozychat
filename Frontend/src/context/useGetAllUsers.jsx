// useGetAllUsers.js
import React, { useState, useEffect } from "react";
import BASE_URL from "../config";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/user/allUsers`, {
          method: "GET",
          headers: {
            // No need to set Authorization manually; cookie handles it
          },
          credentials: "include", // Send the HttpOnly cookie
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setAllUsers(data);
        } else {
          console.error("Unexpected data format, expected array, got:", data);
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error.message);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  return [allUsers, loading];
}

export default useGetAllUsers;