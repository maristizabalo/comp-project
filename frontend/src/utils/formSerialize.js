// src/helpers/formSerialize.js
import dayjs from "dayjs";

/**
 * Convierte los valores del Form (incluye dayjs) a un objeto 100% serializable
 * para guardar en Redux.
 * @param {object} values - form.getFieldsValue()
 * @param {Array} campos - seccion.campos
 */
export function serializeValues(values, campos) {
  const out = {};
  for (const campo of campos) {
    const raw = values?.[campo.nombre];
    switch (campo.tipo) {
      case "fecha":
        // raw puede ser dayjs, string o null
        out[campo.nombre] = raw ? dayjs(raw).format("YYYY-MM-DD") : null;
        break;
      case "numero":
        out[campo.nombre] =
          raw === "" || raw === null || raw === undefined ? null : Number(raw);
        break;
      case "booleano":
        out[campo.nombre] = !!raw;
        break;
      case "seleccion-multiple":
        out[campo.nombre] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        break;
      case "grupo-campos":
        // asume array de objetos simples
        out[campo.nombre] = Array.isArray(raw) ? raw : [];
        break;
      case "geometrico":
        // asegúrate de extraer solo lo serializable si usas mapas
        // por ejemplo { valor_geom: 'WKT...'} o GeoJSON plano
        out[campo.nombre] = raw?.valor_geom ? { valor_geom: raw.valor_geom } : null;
        break;
      default:
        out[campo.nombre] = raw ?? null;
    }
  }
  return out;
}

/**
 * Convierte los valores planos del store a lo que los componentes del Form esperan.
 * @param {object} plano - objeto serializado que está en Redux
 * @param {Array} campos - seccion.campos
 */
export function hydrateValues(plano, campos) {
  const out = {};
  for (const campo of campos) {
    const raw = plano?.[campo.nombre];
    if (campo.tipo === "fecha") {
      out[campo.nombre] = raw ? dayjs(raw, "YYYY-MM-DD") : null;
    } else {
      out[campo.nombre] = raw;
    }
  }
  return out;
}
