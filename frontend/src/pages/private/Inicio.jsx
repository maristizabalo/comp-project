const Inicio = () => {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-3xl w-full border border-[#E80B2C]/20">
        <h1 className="text-4xl font-extrabold text-[#E80B2C] mb-4 flex items-center gap-2">
          <span role="img" aria-label="logo">🏛️</span>
          Sistema Complementarios - DADEP
        </h1>
        <p className="text-base md:text-lg text-gray-800 mb-6 leading-relaxed">
          Bienvenido al sistema de <span className="font-semibold text-[#C95D63]">Complementarios</span> de la{" "}
          <span className="font-semibold text-[#717EC3]">Defensoría del Espacio Público</span>.
          Este aplicativo te permitirá crear y gestionar <span className="font-semibold text-[#AE8799]">categorías</span>,
          <span className="font-semibold text-[#496DDB]"> módulos</span> y <span className="font-semibold text-[#E80B2C]">formularios dinámicos</span>,
          asignar permisos y roles para que cada formulario pueda ser diligenciado y visualizado
          únicamente por los usuarios responsables o autorizados.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center bg-[#C95D63]/20 rounded-xl p-5 shadow-md">
            <span className="text-3xl mb-2">📂</span>
            <h2 className="font-bold text-[#C95D63] mb-1">Categorías</h2>
            <p className="text-sm text-center text-[#C95D63]/90">
              Organiza los formularios por categorías para facilitar su clasificación.
            </p>
          </div>
          <div className="flex flex-col items-center bg-[#717EC3]/20 rounded-xl p-5 shadow-md">
            <span className="text-3xl mb-2">🧩</span>
            <h2 className="font-bold text-[#717EC3] mb-1">Módulos</h2>
            <p className="text-sm text-center text-[#717EC3]/90">
              Agrupa los formularios dentro de módulos según su funcionalidad.
            </p>
          </div>
          <div className="flex flex-col items-center bg-[#496DDB]/20 rounded-xl p-5 shadow-md">
            <span className="text-3xl mb-2">📝</span>
            <h2 className="font-bold text-[#496DDB] mb-1">Formularios</h2>
            <p className="text-sm text-center text-[#496DDB]/90">
              Crea formularios con campos personalizados y controla el acceso a cada uno.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <button className="bg-gradient-to-r from-[#E80B2C] to-[#C95D63] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200">
            Ir al Panel de Gestión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
