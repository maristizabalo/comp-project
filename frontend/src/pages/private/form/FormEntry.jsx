// src/pages/private/form/FormEntry.jsx
import React, { useCallback } from "react";
import { Form, Button, message } from "antd";
import FieldRenderer from "../../../components/form/FieldRenderer";
import {
  useCreateRespuestaMutation,
  useUpdateRespuestaMutation,
} from "../../../store/form/respuestasApi";
import { buildRespuestaPayload } from "../../../utils/buildRespuestaPayload";

const FormEntry = ({ formulario, respuestaId, initialValues = {}, onSuccess }) => {
  const [form] = Form.useForm();

  const [createRespuesta, { isLoading: isSavingCreate }] = useCreateRespuestaMutation();
  const [updateRespuesta, { isLoading: isSavingUpdate }] = useUpdateRespuestaMutation();
  const isSaving = isSavingCreate || isSavingUpdate;

  const onFinish = useCallback(async () => {
    try {
      const values = form.getFieldsValue(true);
      const payload = buildRespuestaPayload(formulario, values);

      if (respuestaId) {
        await updateRespuesta({ id: respuestaId, ...payload }).unwrap();
        message.success("Respuesta actualizada");
      } else {
        await createRespuesta(payload).unwrap();
        message.success("Respuesta creada");
      }

      onSuccess?.();
    } catch (e) {
      console.error(e);
      message.error("No se pudo guardar. Revisa los campos.");
    }
  }, [form, formulario, respuestaId, updateRespuesta, createRespuesta, onSuccess]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      className="p-4"
    >
      {(formulario?.secciones || []).map((sec) => (
        <div key={sec.id} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{sec.titulo}</h3>
          <div className="grid grid-cols-12 gap-4">
            {(sec.campos || []).map((campo) => (
              <div key={campo.id} className="col-span-12 md:col-span-6">
                <FieldRenderer campo={campo} form={form} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <Button htmlType="submit" type="primary" loading={isSaving}>
          {respuestaId ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </Form>
  );
};

export default FormEntry;
