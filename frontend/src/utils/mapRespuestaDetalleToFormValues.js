// src/pages/private/form/utils/mapRespuestaDetalleToFormValues.js

const toScalar = (v) => {
  if (v == null) return v;
  if (Array.isArray(v)) return v.length ? toScalar(v[0]) : null;
  if (typeof v === 'object' && 'value' in v) return toScalar(v.value);
  return v;
};
const toArrayIds = (v) => {
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr
    .map((x) => (typeof x === 'object' && x && 'value' in x ? x.value : x))
    .filter((x) => x != null);
};

/**
 * detalle esperado (flexible):
 * {
 *   ...,
 *   valores: {
 *     [campoNombreSimple]: <valor | [ids] | obj>,
 *     [grupoNombre]: [ { nombre, tipo, valor }, ... ]
 *   }
 * }
 */
export function mapRespuestaDetalleToFormValues(formulario, detalle) {
  const out = {};
  const valores = detalle?.valores || detalle || {}; // fallback defensivo

  (formulario?.secciones || []).forEach((sec) => {
    (sec?.campos || []).forEach((c) => {
      const t = (c?.tipo || '').toLowerCase();
      const nombre = c?.nombre;

      if (t === 'grupo-campos') {
        // Esperamos un array [{nombre, tipo, valor}, ...]
        const grp = valores?.[nombre];
        if (Array.isArray(grp)) {
          out[nombre] = grp.map((r) => ({
            nombre: r?.nombre,
            tipo: (r?.tipo || '').toLowerCase(),
            valor: r?.valor,
          }));
        } else if (grp && typeof grp === 'object') {
          // A veces llega { subNombre: valor|[vals] }
          const rows = [];
          const subDefs = (c?.subcampos?.campos || []).reduce((acc, sd) => {
            acc[sd.nombre] = sd;
            return acc;
          }, {});
          Object.entries(grp).forEach(([subName, v]) => {
            const subDef = subDefs[subName];
            if (!subDef) return;
            const st = (subDef?.tipo || '').toLowerCase();
            if (st === 'seleccion-multiple' && Array.isArray(v)) {
              rows.push({ nombre: subName, tipo: st, valor: toArrayIds(v) });
            } else if (st === 'seleccion-unica') {
              rows.push({ nombre: subName, tipo: st, valor: toScalar(v) });
            } else if (st === 'geometrico' || st === 'geometria') {
              rows.push({ nombre: subName, tipo: st, valor: { valor_geom: v } });
            } else {
              rows.push({ nombre: subName, tipo: st, valor: v });
            }
          });
          out[nombre] = rows;
        } else {
          out[nombre] = [];
        }
        return;
      }

      // Campos simples
      const v = valores?.[nombre];
      if (t === 'seleccion-unica') {
        out[nombre] = toScalar(v);
      } else if (t === 'seleccion-multiple') {
        out[nombre] = toArrayIds(v);
      } else if (t === 'geometrico' || t === 'geometria' || t === 'geometry') {
        out[nombre] = v ? { valor_geom: v } : undefined;
      } else {
        out[nombre] = v;
      }
    });
  });

  return out;
}
