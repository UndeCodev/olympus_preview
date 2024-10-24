import olympusAPI from '@/api/olympusAPI';

export const registerAction = async ({ name, lastname, email, phone, password }) => {
  try {
    const { data } = await olympusAPI.post('/auth/register', {
      name,
      lastname,
      email,
      phone,
      password,
    });

    return {
      ok: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    const errorMessage = error.response.data.message;

    return {
      ok: false,
      message: errorMessage,
    };
  }
};
