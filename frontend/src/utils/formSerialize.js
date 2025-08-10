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
    const tipo = (campo.tipo || "").toLowerCase();

    switch (tipo) {
      case "fecha": {
        out[campo.nombre] = raw ? dayjs(raw).format("YYYY-MM-DD") : null;
        break;
      }

      case "numero": {
        out[campo.nombre] =
          raw === "" || raw === null || raw === undefined ? null : Number(raw);
        break;
      }

      case "booleano": {
        out[campo.nombre] = !!raw;
        break;
      }

      case "seleccion-multiple": {
        out[campo.nombre] = Array.isArray(raw) ? raw : raw ? [raw] : [];
        break;
      }

      case "grupo-campos": {
        // Esperamos un array de items: { nombre, tipo, valor }
        const items = Array.isArray(raw) ? raw : [];
        out[campo.nombre] = items.map((item) => {
          const itTipo = (item?.tipo || "").toLowerCase();
          let valor = item?.valor;

          if (itTipo === "fecha") {
            valor = valor ? dayjs(valor).format("YYYY-MM-DD") : null;
          } else if (itTipo === "numero") {
            valor =
              valor === "" || valor === null || valor === undefined
                ? null
                : Number(valor);
          } else if (itTipo === "booleano") {
            valor = !!valor;
          } else if (itTipo === "seleccion-multiple") {
            valor = Array.isArray(valor) ? valor : valor ? [valor] : [];
          } else {
            // texto / seleccion-unica / otros
            valor = valor ?? null;
          }

          return {
            nombre: item?.nombre ?? "",
            tipo: itTipo,
            valor,
          };
        });
        break;
      }

      case "geometrico": {
        // Guarda solo el GeoJSON (lo que pinta tu mapa)
        out[campo.nombre] = raw?.valor_geom ?? null;
        break;
      }

      default: {
        out[campo.nombre] = raw ?? null;
      }
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
    const tipo = (campo.tipo || "").toLowerCase();

    if (tipo === "fecha") {
      out[campo.nombre] = raw ? dayjs(raw, "YYYY-MM-DD") : null;
      continue;
    }

    if (tipo === "grupo-campos") {
      const items = Array.isArray(raw) ? raw : [];
      out[campo.nombre] = items.map((item) => {
        const itTipo = (item?.tipo || "").toLowerCase();
        let valor = item?.valor;

        if (itTipo === "fecha") {
          valor = valor ? dayjs(valor, "YYYY-MM-DD") : null;
        } else if (itTipo === "numero") {
          valor =
            valor === "" || valor === null || valor === undefined
              ? null
              : Number(valor);
        } else if (itTipo === "booleano") {
          valor = !!valor;
        } else if (itTipo === "seleccion-multiple") {
          valor = Array.isArray(valor) ? valor : valor ? [valor] : [];
        } else {
          valor = valor ?? null;
        }

        return {
          nombre: item?.nombre ?? "",
          tipo: itTipo,
          valor,
        };
      });
      continue;
    }

    if (tipo === "geometrico") {
      // El Mapa espera { valor_geom: <GeoJSON> }
      out[campo.nombre] = raw ? { valor_geom: raw } : null;
      continue;
    }

    // Resto
    out[campo.nombre] = raw;
  }

  return out;
}
