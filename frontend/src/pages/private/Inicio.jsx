const Inicio = () => {
    console.log("mostrando Inicio");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-purple-200">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4 flex items-center gap-2">
          <span role="img" aria-label="star">
            ✨
          </span>
          Sistema de Complementarios
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          ¡Bienvenido! Aquí podrás gestionar y visualizar tus{" "}
          <span className="font-semibold text-blue-600">complementarios</span>{" "}
          de una forma <span className="italic text-pink-500">única</span> y{" "}
          <span className="underline decoration-wavy decoration-purple-400">
            chevere
          </span>
          .
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center bg-gradient-to-tr from-pink-200 to-pink-400 rounded-xl p-5 shadow-lg">
            <span className="text-3xl mb-2">📚</span>
            <h2 className="font-bold text-pink-700 mb-1">Tus Cursos</h2>
            <p className="text-sm text-pink-900 text-center">
              Visualiza y administra los cursos complementarios que has
              inscrito.
            </p>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-blue-200 to-blue-400 rounded-xl p-5 shadow-lg">
            <span className="text-3xl mb-2">📝</span>
            <h2 className="font-bold text-blue-700 mb-1">Inscripciones</h2>
            <p className="text-sm text-blue-900 text-center">
              Inscríbete fácilmente en nuevas actividades y talleres.
            </p>
          </div>
          <div className="flex flex-col items-center bg-gradient-to-tr from-purple-200 to-purple-400 rounded-xl p-5 shadow-lg">
            <span className="text-3xl mb-2">🏆</span>
            <h2 className="font-bold text-purple-700 mb-1">Progreso</h2>
            <p className="text-sm text-purple-900 text-center">
              Sigue tu avance y obtén reconocimientos por tu esfuerzo.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="#"
            className="ant-btn ant-btn-primary bg-gradient-to-r from-purple-500 to-pink-500 border-none text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            ¡Explora tus complementarios!
          </a>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
