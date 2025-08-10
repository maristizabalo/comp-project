// src/pages/form/FormResponses.jsx
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Table, Button, Space, message } from "antd";
import { EyeOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useFetch } from "../../../hooks/use-fetch";
import { formService } from "../../../services/form/formService";

function buildColumns(apiColumns, onView, onEdit) {
  const cols = (apiColumns || []).map((c) => {
    const isDate = c.key === "fecha_creacion";
    return {
      key: c.key,
      dataIndex: c.key,
      title: c.title,
      width: c.key === "id" ? 90 : undefined,
      ellipsis: !isDate && c.key !== "id",
      render: (val) =>
        isDate && val ? dayjs(val).format("YYYY-MM-DD HH:mm") : val ?? "—",
    };
  });

  cols.push({
    key: "actions",
    title: "Acciones",
    fixed: "right",
    width: 150,
    render: (_, row) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => onView(row)}>
          Ver
        </Button>
        <Button
          size="small"
          type="primary"
          ghost
          icon={<EditOutlined />}
          onClick={() => onEdit(row)}
        >
          Editar
        </Button>
      </Space>
    ),
  });

  return cols;
}

const FormResponses = () => {
  const { id: formularioId } = useParams(); // ruta: /formularios/respuestas/:id
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page") || 1);
  const initialPageSize = Number(searchParams.get("page_size") || 10);

  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const { loading, error, data, fetchData } = useFetch();

  const load = React.useCallback(async () => {
    try {
      await fetchData(formService.getRespuestasTabla, Number(formularioId), {
        page,
        pageSize,
      });
    } catch (e) {
      message.error(e.message || "Error cargando respuestas");
    }
  }, [fetchData, formularioId, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  // sync query params
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onView = React.useCallback(
    (row) => {
      // navigar a ver respuesta detallada page
      navigate(`/formularios/${formularioId}/respuestas/${row.id}`);
    },
    [navigate, formularioId]
  );

  const onEdit = React.useCallback(
    (row) => {
      // Reabrir la diligenciación con respuestaId
      navigate(`/formularios/diligenciar/${formularioId}?respuestaId=${row.id}`);
    },
    [navigate, formularioId]
  );

  const columns = React.useMemo(
    () => buildColumns(data?.columns || [], onView, onEdit),
    [data?.columns, onView, onEdit]
  );

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Respuestas — Formulario #{formularioId}
            </span>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={load}
              loading={loading}
            >
              Recargar
            </Button>
          </div>
        }
        className="rounded-2xl shadow-sm"
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data?.results || []}
          scroll={{ x: true }}
          pagination={{
            current: page,
            pageSize,
            total: Number(data?.count || 0),
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (t, range) => `${range[0]}–${range[1]} de ${t}`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />

        {error ? <div className="mt-2 text-red-500 text-sm">{error}</div> : null}
      </Card>
    </div>
  );
};

export default FormResponses;
