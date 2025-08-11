
// ---------- Helpers de coerción ----------
const asId = (v) => {
  if (v == null) return null;
  if (Array.isArray(v)) return v.length ? asId(v[0]) : null;
  if (typeof v === 'object' && v !== null && 'value' in v) return asId(v.value);
  if (typeof v === 'string' || typeof v === 'number') return v;
  return null;
};

const asIdArray = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(asId).filter((x) => x != null);
  return [asId(v)].filter((x) => x != null);
};

const asDateString = (v) => {
  if (!v) return null;
  // AntD DatePicker (v5/v6) suele dar dayjs; si es string, lo dejamos
  if (typeof v?.format === 'function') return v.format('YYYY-MM-DD');
  if (typeof v === 'string') return v;
  return null;
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// ---------- Serialización por tipo ----------
const serializeSimpleField = (campoDef, raw) => {
  const { id, tipo } = campoDef;
  const t = (tipo || '').toLowerCase();

  if (t === 'seleccion-unica') {
    const idSel = asId(raw);
    return idSel != null ? [{ campo: id, valor_opcion: idSel }] : [];
  }

  if (t === 'seleccion-multiple') {
    const ids = asIdArray(raw);
    return ids.length ? [{ campo: id, valor_opciones: ids }] : [];
  }

  if (t === 'booleano') {
    if (raw === undefined) return [];
    return [{ campo: id, valor_booleano: Boolean(raw) }];
  }

  if (t === 'numero') {
    if (raw === undefined || raw === null || raw === '') return [];
    const n = Number(raw);
    return Number.isFinite(n) ? [{ campo: id, valor_numero: n }] : [];
  }

  if (t === 'fecha') {
    const s = asDateString(raw);
    return s ? [{ campo: id, valor_fecha: s }] : [];
  }

  if (t === 'geometria' || t === 'geometry') {
    // Se asume GeoJSON (o WKT si lo usas). Si vienes de ArcGIS, conviértelo antes.
    return raw ? [{ campo: id, valor_geom: raw }] : [];
  }

  // texto (default)
  if (raw === undefined) return [];
  return [{ campo: id, valor_texto: raw ?? null }];
};

// Grupo-campos: filas con { nombre, tipo, valor }
const serializeGroupField = (campoGrupoDef, rawRows) => {
  if (!Array.isArray(rawRows) || !rawRows.length) return [];
  const subDefs = (campoGrupoDef?.subcampos?.campos || []).reduce((acc, sd) => {
    acc[sd.nombre] = sd;
    return acc;
  }, {});
  const rows = [];

  rawRows.forEach((row) => {
    // row esperado: { nombre, tipo, valor }
    const rowName = row?.nombre;
    const subDef = subDefs[rowName];
    if (!subDef) return;

    // Usar row.valor; si es selección única y vino como array/labelInValue, coaccionar en serializeSimpleField
    rows.push(...serializeSimpleField(subDef, row?.valor));
  });

  return rows;
};

// ---------- Builder principal ----------
export function buildRespuestaPayload(formulario, values) {
  // formulario: { secciones: [ { campos: [ ... ] } ] }
  const respuestas_campo = [];

  (formulario?.secciones || []).forEach((sec) => {
    (sec?.campos || []).forEach((c) => {
      const nombre = c?.nombre;
      const tipo = (c?.tipo || '').toLowerCase();
      const raw = values?.[nombre];

      if (tipo === 'grupo-campos') {
        respuestas_campo.push(...serializeGroupField(c, raw));
      } else {
        respuestas_campo.push(...serializeSimpleField(c, raw));
      }
    });
  });

  return {
    formulario: formulario?.id,
    respuestas_campo,
  };
}
