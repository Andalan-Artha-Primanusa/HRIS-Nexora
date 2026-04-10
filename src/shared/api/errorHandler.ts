/**
 * Error handler utility untuk extract dan format error message dari API response
 * Prioritas: userMessage > response message > error message > default message
 */
export const getErrorMessage = (error: any): string => {
  // Check for custom userMessage dari interceptor
  if (error.userMessage) {
    return error.userMessage;
  }

  // Check untuk message dari API response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check untuk error message
  if (error.message) {
    return error.message;
  }

  // Default message
  return 'Terjadi kesalahan. Silahkan coba lagi.';
};

/**
 * Determine alert type berdasarkan HTTP status code
 */
export const getAlertTypeFromStatus = (status?: number): 'error' | 'warning' | 'info' => {
  if (!status) return 'error';
  
  if (status >= 500) return 'error';
  if (status === 403 || status === 401) return 'error';
  if (status >= 400) return 'warning';
  
  return 'error';
};

/**
 * Helper untuk error handling dalam catch block
 * Usage: const message = extractErrorMessage(err);
 */
export const extractErrorMessage = (error: any): string => {
  return getErrorMessage(error);
};
