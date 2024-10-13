const isAuthenticatedGuard = (to, from, next) => {
  const token = localStorage.getItem('token');
  const lastPath = localStorage.setItem('last-path', to.path);

  if (!token) {
    return next({ name: 'inicio-sesion' });
  }

  next(lastPath);
};

export default isAuthenticatedGuard;
