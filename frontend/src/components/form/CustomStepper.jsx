import React from "react";
import { Steps, Progress } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  SendOutlined,
  InfoCircleOutlined,
  ProfileOutlined,
  TagOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setStep } from "../../store/form/formEntrySlice";

const iconsList = [
  FileTextOutlined,
  CheckCircleOutlined,
  SendOutlined,
  InfoCircleOutlined,
  ProfileOutlined,
  TagOutlined
];

const CustomStepper = ({ total, titles }) => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.formulario.formEntry.currentStep);
  const items = Array.from({ length: total }).map((_, idx) => {
    const IconComponent = iconsList[idx % iconsList.length];
    return {
      title: titles?.[idx] || `Sección ${idx + 1}`,
      icon: <IconComponent />
    };
  });
  const percent = Math.round((currentStep + 1) / total * 100);
  return (
    <>
      <Steps
        current={currentStep}
        items={items}
        onChange={(step) => dispatch(setStep(step))}
        className="mb-4"
      />
      <Progress
        percent={percent}
        showInfo={false}
        strokeLinecap="round"
        className="my-2"
      />
    </>
  );
};

export default React.memo(CustomStepper);