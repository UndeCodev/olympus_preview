import olympusAPI from '@/api/olympusAPI';
import { isAxiosError } from 'axios';

export const loginAction = async (email, password, tokenCaptcha) => {
  try {
    const { data } = await olympusAPI.post('/auth/login', {
      email,
      password,
      tokenCaptcha,
    });

    return {
      ok: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    const errorMessage = error.response.data.message;
    const errorStatus = error.status;
    const timeRemaining = error.response.data?.timeRemaining ?? 0;

    const errorCodes = [401, 403, 404];

    if (isAxiosError(error) && errorCodes.includes(errorStatus)) {
      return {
        ok: false,
        message: errorMessage,
        timeRemaining,
      };
    }

    throw 'Hubo un problema al hacer la solicitud, inténtalo de nuevo más tarde.';
  }
};
