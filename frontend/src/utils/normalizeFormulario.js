// src/utils/normalizeFormulario.js
export const normalizeFormularioCreatePayload = (values) => {
  const secciones = (values.secciones || []).map((seccion, i) => ({
    ...seccion,
    orden: i + 1,
    campos: (seccion.campos || []).map((campo, j) => {
      const campoNormalizado = {
        ...campo,
        nombre: campo.etiqueta,
        orden: j + 1,
      };

      // Añadir opciones si existen y tienen contenido
      if (Array.isArray(campo.opciones) && campo.opciones.length > 0) {
        campoNormalizado.opciones = campo.opciones;
      }

      // Añadir subcampos si existen y tienen campos válidos
      if (
        campo.subcampos &&
        Array.isArray(campo.subcampos.campos) &&
        campo.subcampos.campos.length > 0
      ) {
        campoNormalizado.subcampos = campo.subcampos;
      }

      return campoNormalizado;
    }),
  }));

  return {
    titulo: values.titulo,
    descripcion: values.descripcion,
    categoriaId: values.categoriaId,
    secciones,
  };
};
