import olympusAPI from '@/api/olympusAPI';

export const registerAction = async ({
  firstname,
  lastname,
  phone,
  birthdate,
  email,
  password,
}) => {
  try {
    await olympusAPI.post('/auth/register', {
      firstname,
      lastname,
      phone,
      birthdate,
      email,
      password,
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message;

    return {
      ok: false,
      message: errorMessage,
    };
  }
};
