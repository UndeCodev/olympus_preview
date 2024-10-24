import olympusAPI from '@/api/olympusAPI';

export const checkAuthAction = async () => {
  const localToken = localStorage.getItem('token');
  if (!localToken || localToken.length < 10) return { ok: false };

  try {
    const { data } = await olympusAPI.get('/auth/verify-token');

    return {
      ok: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
    };
  }
};
