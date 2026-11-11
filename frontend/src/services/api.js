const api = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("ayurdhara_token")
        ? { Authorization: `Bearer ${localStorage.getItem("ayurdhara_token")}` }
        : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
};

export default api;
export { api };
