const sendResponse = (res, status, success, data, error, message) => {
  const response = {};
  if (success) response.success = success;
  if (data) response.data = data;
  if (error) response.error = error;
  if (message) response.message = message;
  res.status(status).json(response);
};
module.exports = sendResponse;
